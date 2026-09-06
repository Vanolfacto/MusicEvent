"""
Faza 2 (v2) — samostalan prototip, NE dira ml-service/app niti trenutni Spotify model.

Prosireni dataset (local_artists_v2.csv, 61 red) direktno adresira ogranicenje
primeceno u v1: sada vise izvora nezavisno potvrdjuje isti tip nastupa (npr. i
Bendovi Srbije i Republika Bend i Vivo Bendovi nezavisno oznacavaju WEDDING), a
festivalski lineup-ovi (Guca, Nisville) dodaju nezavisnu FESTIVAL kategoriju sa
zanrovima (FOLK, JAZZ) koji se preklapaju sa zanrovima iz svadbenog konteksta —
ovo razbija savrsenu korelaciju izvor<->oznaka iz v1.

Cilj: proveriti da li zanr + tip sastava + poznat grad predvidja primarni tip
dogadjaja (CONCERT / CLUB_NIGHT / WEDDING / FESTIVAL), i da li signal opstaje
i na podskupu gde je oznaka nezavisno potvrdjena po izvodjacu (label_source =
per_artist), ne samo izvedena iz kategorije sajta (site_category).
"""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATA_PATH = Path(__file__).parent / "local_artists_v2.csv"


def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df["city_known"] = df["city"].notna().astype(int)
    df["member_type"] = (
        df["member_info"]
        .fillna("unknown")
        .str.replace(r"\(\d+\)", "", regex=True)
        .str.strip()
        .replace("", "unknown")
    )
    return df


def build_pipeline(model) -> Pipeline:
    categorical = ["genre_bucket", "member_type"]
    numeric = ["city_known"]
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
            ("num", "passthrough", numeric),
        ]
    )
    return Pipeline(steps=[("prep", preprocessor), ("model", model)])


def evaluate(name: str, df: pd.DataFrame, model_factory, min_class_count: int = 2) -> None:
    counts = df["primary_event_type"].value_counts()
    keep_classes = counts[counts >= min_class_count].index
    d = df[df["primary_event_type"].isin(keep_classes)]
    if d["primary_event_type"].nunique() < 2 or len(d) < 10:
        print(f"\n=== {name} === PRESKOCENO (premalo redova/klasa: {len(d)})")
        return

    X = d[["genre_bucket", "member_type", "city_known"]]
    y = d["primary_event_type"].to_numpy()
    n_splits = min(5, counts[keep_classes].min())
    if n_splits < 2:
        print(f"\n=== {name} === PRESKOCENO (najmanja klasa ima <2 primera)")
        return
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)

    pipeline = build_pipeline(model_factory())
    preds = cross_val_predict(pipeline, X, y, cv=cv)
    macro_f1 = f1_score(y, preds, average="macro")
    majority_baseline = counts[keep_classes].max() / len(d)

    print(f"\n=== {name} (n={len(d)}, {n_splits}-fold CV) ===")
    print(f"Distribucija klasa: {dict(counts[keep_classes])}")
    print(f"Macro F1: {macro_f1:.3f}")
    print(f"Baseline (uvek predvidi vecinsku klasu): {majority_baseline:.3f}")
    print(classification_report(y, preds, zero_division=0))
    if macro_f1 <= majority_baseline + 0.05:
        print("NALAZ: model ne prevazilazi bitno naivni baseline na ovom podskupu.")
    else:
        print("NALAZ: model prevazilazi naivni baseline — ima signal iznad slucajnog.")


def main() -> None:
    df = load_data()
    print(f"Ukupno redova (v2): {len(df)}")
    print(df["primary_event_type"].value_counts())
    print("\nOznaka po izvoru pouzdanosti:")
    print(df["label_source"].value_counts())

    evaluate(
        "Logistic Regression — ceo dataset (site_category + per_artist)",
        df,
        lambda: LogisticRegression(max_iter=1000),
    )
    evaluate(
        "Random Forest — ceo dataset (site_category + per_artist)",
        df,
        lambda: RandomForestClassifier(n_estimators=50, random_state=42),
    )

    per_artist_only = df[df["label_source"] == "per_artist"]
    print(f"\n--- Podskup sa nezavisno potvrdjenom oznakom po izvodjacu: {len(per_artist_only)} redova ---")
    evaluate(
        "Logistic Regression — SAMO per_artist oznake (najstroziji test)",
        per_artist_only,
        lambda: LogisticRegression(max_iter=1000),
        min_class_count=2,
    )

    print(
        "\nNapomena: i dalje mali uzorak (61 red ukupno, jos manje u per_artist "
        "podskupu) — ovo ostaje orijentacioni prototip, ne produkcioni model. "
        "Svrha ovog koraka je da se profesoru iskreno prijavi da li postoji "
        "merljiv signal pre bilo kakve integracije u sistem."
    )


if __name__ == "__main__":
    main()
