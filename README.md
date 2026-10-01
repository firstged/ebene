# ÉBÈNE

Site vitrine de la marque **ÉBÈNE** — savons saponifiés à froid et huiles
pressées à froid, fabriqués à la main à Libreville, Gabon.

**En ligne :** https://firstged.github.io/ebene/

## Parti pris technique

Aucune dépendance. Pas de framework, pas de bundler, pas de GSAP, pas de
Lenis. Trois fichiers, tout écrit à la main :

```
index.html        page autonome
css/ebene.css     feuille de style unique
js/ebene.js       interactions
```

La commande se conclut sur WhatsApp : la vente en ligne de produits
cosmétiques est interdite au Gabon par l'ANMAPS, et Stripe n'y opère pas.
Le site convainc, la transaction se fait par message et mobile money.

## Ce qui est fait maison

- **Preloader** — la feuille de manioc se remplit par le bas pendant que le
  compteur monte. Piloté par `setInterval`, pas par `requestAnimationFrame` :
  rAF ne se déclenche pas dans un document masqué, ce qui bloquerait la page
  sur l'écran de chargement. Chien de garde à 7 s.
- **Feuille de manioc** — SVG paramétrique, cinq lobes rayonnants, déclinée
  en version pleine et au trait.
- **Effet de remplacement** — chaque lettre doublée dans une fenêtre qui
  glisse, décalage de 26 ms par lettre.
- **Illustrations botaniques** — gingembre, moringa, papaye, ndolé, coco,
  maningu, citron, tracées au trait, révélées au survol des cartes.
- **Vagues de séparation** — huit tracés SVG distincts, aucun répété.
- **Le jeu** — tranche les savons. Physique, collision segment/cercle,
  découpe en deux moitiés, le tout en canvas pur.
- **Accessibilité** — `prefers-reduced-motion` neutralise toutes les
  animations, focus visible partout, contenu lisible sans JavaScript.

## Développement

Ouvrir `index.html` dans un navigateur. Rien à installer.

Le numéro WhatsApp se change à la ligne 14 de `js/ebene.js`.

`build-artifact.py` dérive une variante sans balises englobantes pour
l'aperçu Claude — inutile au déploiement.

## Crédits

Produits : fabriqués à la main à Libreville.
Design et code : [Gfirst](https://github.com/firstged)
