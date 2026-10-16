"""Expo 2025 Osaka: daily visitors from the official weekly news pages
("Number of Visitors and Admission Ticket Sales Status", www.expo2025.or.jp/en/news/).

Reads saved copies of the pages (data/raw/osaka_pages/*.html, not in Git) and writes
data/expo2025_osaka_daily.csv. Days that are not on any page are reported, never filled in.
Usage: python sim/osaka_collect.py
"""
import datetime as dt
import html
import re

import pandas as pd

from ai_routing import DATA

PAGES = DATA / "raw" / "osaka_pages"
OPEN, CLOSE = dt.date(2025, 4, 13), dt.date(2025, 10, 13)
MONTHS = {m: i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July", "August",
                                      "September", "October", "November", "December"], 1)}
DAYS = "Mon|Tue|Wed|Thu|Fri|Sat|Sun"
TOTAL = re.compile(r"Total ([\d,]+) ([\d,]+)")
ROW = re.compile(rf"(\d{{1,2}}) ?({'|'.join(MONTHS)})\.? \(?(?:{DAYS})\.?\)?(?: \([^)]*\))? (\d{{1,3}}(?:[,.]\d{{3}})+) (\d{{1,3}}(?:[,.]\d{{3}})*)")


def page_text(path):
    t = path.read_text(encoding="utf-8")
    t = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t)))


def main():
    rows = []
    for p in sorted(PAGES.glob("*.html")):
        url = f"https://www.expo2025.or.jp/en/news/news-{p.stem}/"
        text = page_text(p)
        found = ROW.findall(text)
        num = lambda s: int(s.replace(",", "").replace(".", ""))  # one page writes 18.022 for 18,022
        for day, month, total, accr in found:
            rows.append({"date": dt.date(2025, MONTHS[month], int(day)), "total_visitors": num(total),
                         "accreditation_visitors": num(accr), "source_url": url})
        tot = TOTAL.search(text)
        check = "no Total row" if not tot else (
            "sum matches page Total" if (sum(num(r[2]) for r in found), sum(num(r[3]) for r in found)) == (num(tot[1]), num(tot[2]))
            else f"SUM DIFFERS from page Total {tot[1]} / {tot[2]}")
        print(p.stem, "rows:", len(found), "|", check)
    df = pd.DataFrame(rows)
    # the same day on two pages must agree; keep the first and report any disagreement
    dup = df[df.duplicated("date", keep=False)]
    for d, g in dup.groupby("date"):
        if g[["total_visitors", "accreditation_visitors"]].nunique().max() > 1:
            print("DISAGREE", d, g.to_dict("records"))
    df = df.drop_duplicates("date").sort_values("date")
    df = df[(df["date"] >= OPEN) & (df["date"] <= CLOSE)]
    df["general_visitors"] = df["total_visitors"] - df["accreditation_visitors"]
    df = df[["date", "total_visitors", "accreditation_visitors", "general_visitors", "source_url"]]
    df.to_csv(DATA / "expo2025_osaka_daily.csv", index=False)
    every = pd.date_range(OPEN, CLOSE).date
    missing = [d for d in every if d not in set(df["date"])]
    print("days collected:", len(df), "of", len(every))
    print("missing days:", [str(d) for d in missing])
    print("sum of total_visitors:", int(df["total_visitors"].sum()))


if __name__ == "__main__":
    main()
