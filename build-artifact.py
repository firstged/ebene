#!/usr/bin/env python3
"""Génère la variante « corps seul » du site pour l'aperçu Artifact de Claude.

Le dépôt contient une page autonome (doctype + head + body), telle qu'elle
est servie par GitHub Pages. L'aperçu Artifact, lui, fournit son propre
squelette : il attend le contenu du body sans les balises englobantes.
Ce script dérive la seconde depuis la première — une seule source à maintenir.
"""
import io, os, re

SRC = "index.html"
OUT = os.path.join(".artifact", "index.html")

html = io.open(SRC, encoding="utf-8").read()

title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).split("—")[0].strip()
body = html[html.index("<body>") + len("<body>"):html.rindex("</body>")].strip()
fonts = re.findall(r'<link rel="(?:preconnect|stylesheet)"[^>]*>', html)
fonts = [f for f in fonts if "fonts." in f or "ebene.css" in f]

os.makedirs(".artifact", exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(
    "<title>%s</title>\n%s\n\n%s\n" % (title, "\n".join(fonts), body)
)
print("ecrit %s (%d octets)" % (OUT, os.path.getsize(OUT)))
