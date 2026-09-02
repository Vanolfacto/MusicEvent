"""Rule-based recommendation explanations."""

from __future__ import annotations

from typing import Any


def build_explanation(features: dict[str, Any], score: float) -> list[str]:
    explanations: list[str] = []

    if features.get("genre_match", 0) >= 0.5:
        explanations.append("Žanr se podudara")
    else:
        explanations.append("Žanr se delimično ili ne podudara")

    if features.get("budget_match", 0) >= 0.5:
        explanations.append("Honorar je u okviru budžeta")
    else:
        explanations.append("Honorar je van optimalnog budžeta događaja")

    if features.get("same_city", 0) >= 0.5:
        explanations.append("Izvođač se nalazi u istom gradu")
    else:
        explanations.append("Izvođač je iz drugog grada")

    if features.get("artist_type_match", 0) >= 0.5:
        explanations.append("Tip izvođača odgovara zahtevu događaja")

    rating = float(features.get("average_rating", 0))
    if rating >= 4.5:
        explanations.append("Prosečna ocena je viša od 4.5")
    elif rating >= 4.0:
        explanations.append(f"Prosečna ocena je {rating:.1f}")

    if features.get("artist_available", 0) < 0.5:
        explanations.append("Izvođač trenutno nije označen kao dostupan")

    if features.get("past_success_similar_events", 0) >= 0.6:
        explanations.append("Izvođač ima dobru istoriju na sličnim događajima")

    if features.get("genre_popularity", 0) >= 0.4:
        explanations.append("Žanr je trenutno popularan (na osnovu analize realnih muzičkih podataka)")

    if score >= 0.8:
        explanations.insert(0, "Visoka verovatnoća pogodnosti")
    elif score >= 0.6:
        explanations.insert(0, "Umerena verovatnoća pogodnosti")

    return explanations[:5]


def summarize_explanation(explanations: list[str]) -> str:
    if not explanations:
        return "Nema dostupnog objašnjenja."
    return (
        "Izvođač je preporučen jer "
        + ", ".join(explanations[:4]).lower()
        + "."
    )
