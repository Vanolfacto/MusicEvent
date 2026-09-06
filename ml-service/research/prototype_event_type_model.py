"""
Samostalan prototip (Faza 2) — NE dira ml-service/app niti trenutni Spotify model.

Cilj: proveriti da li se na osnovu 40 realnih, ručno prikupljenih lokalnih izvođača
(local_artists_raw.csv) može naučiti smislena veza između atributa izvođača
(žanr, tip sastava, poznat grad) i tipa nastupa za koji se realno rezervišu
(klub/koncert vs svadba/proslava).

Ovo je istraživački korak pre bilo kakve integracije — rezultat se prijavljuje
profesoru pre nego što se bilo šta menja u živom sistemu.
"""

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

DATA_PATH = Path(__file__).parent / "local_artists_raw.csv"


def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df["city_known"] = df["city"].notna().astype(int)
    df["member_info"] = df["member_info"].fillna("unknown")
    df["genre_bucket"] = df["genre_bucket"].fillna("OTHER")
    return df


def build_pipeline(model) -> Pipeline:
    categorical = ["genre_bucket", "member_info"]
    numeric = ["city_known"]
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
            ("num", "passthrough", numeric),
        ]
    )
    return Pipeline(steps=[("prep", preprocessor), ("model", model)])


def evaluate(name: str, pipeline: Pipeline, X: pd.DataFrame, y: np.ndarray, cv) -> None:
    preds = cross_val_predict(pipeline, X, y, cv=cv)
    acc = accuracy_score(y, preds)
    f1 = f1_score(y, preds, pos_label="svadba/proslava")
    majority_baseline = max(np.mean(y == cls) for cls in np.unique(y))
    print(f"\n=== {name} ===")
    print(f"Accuracy (5-fold CV): {acc:.3f}")
    print(f"F1 (klasa 'svadba/proslava', 5-fold CV): {f1:.3f}")
    print(f"Baseline (uvek predvidi većinsku klasu): {majority_baseline:.3f}")
    if acc <= majority_baseline + 0.05:
        print("NALAZ: model ne prevazilazi bitno naivni baseline na ovom uzorku.")
    else:
        print("NALAZ: model prevazilazi naivni baseline — ima signal iznad slučajnog.")


def main() -> None:
    df = load_data()
    print(f"Ukupno redova: {len(df)}")
    print(df["event_type"].value_counts())

    X = df[["genre_bucket", "member_info", "city_known"]]
    y = df["event_type"].to_numpy()

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    evaluate("Logistic Regression", build_pipeline(LogisticRegression(max_iter=1000)), X, y, cv)
    evaluate(
        "Random Forest (50 stabala)",
        build_pipeline(RandomForestClassifier(n_estimators=50, random_state=42)),
        X,
        y,
        cv,
    )

    print(
        "\nNapomena: uzorak od 40 redova sa neuravnoteženim klasama (31/9) je premali "
        "za statistički pouzdane zaključke — ovo je isključivo orijentacioni prototip, "
        "u skladu sa profesorovom instrukcijom da se prvo proveri da li postoji signal "
        "pre bilo kakvog uvođenja u sistem."
    )


if __name__ == "__main__":
    main()
