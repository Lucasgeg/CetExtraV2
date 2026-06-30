# CET⚡EXTRA — Design System

Version 1.0 · 2026  
Trois espaces : **Pro** (entreprises), **Extra** (candidats), **Public** (marketing/auth).

---

## 1. Identité & Logo

**Forme textuelle :** `CET⚡EXTRA`  
**Concept :** bleu institutionnel (Pro) + ambre énergie (Extra) + éclair ⚡ comme lien instantané.

| Variante | Fond | Couleur texte `CET` | Couleur `⚡` | Couleur `EXTRA` |
|---|---|---|---|---|
| Sur fond sombre | `#06041B → #33335E` (gradient) | `white` | `#FDBA3B` | `white` |
| Sur fond clair | `#F4F7FA` | `#33335E` | `#F15A29` | `#33335E` |
| Sur gradient de marque | gradient complet | `white` | `#06041B` | `white` |

**Font du logo :** `font-weight: 900`, `letter-spacing: -0.02em`

---

## 2. Couleurs

### 2.1 Gradient de marque (transversal)

Utilisé sur les hero, dividers, éléments de marque. **Interdit sur les boutons internes.**

```
linear-gradient(90deg, #22345E 0%, #FDBA3B 60%, #F15A29 100%)
```

| Token | Hex | Rôle |
|---|---|---|
| `brand-gradient-start` | `#22345E` | Départ |
| `brand-gradient-mid` | `#FDBA3B` | Milieu |
| `brand-gradient-end` | `#F15A29` | Fin |

---

### 2.2 Espace Pro — Bleu institutionnel

Routes : `/company`, `/company/missions`, `/company/missions/[id]`  
Fond général : clair (`#F4F7FA`). Dark mode : non supporté.

| Token | Hex | Usage |
|---|---|---|
| `employer.primary` | `#33335E` | Bouton CTA, header, logo |
| `employer.secondary` | `#2E7BA6` | Liens, accents |
| `employer.accent` | `#EA5F3E` | Alerte, urgence |
| `employer.background` | `#F4F7FA` | Fond de page |
| `employer.surface` | `#E6ECF3` | Cards, surfaces secondaires |
| `employer.border` | `#C9D6E2` | Bordures, séparateurs |
| `employer.text.primary` | `#232336` | Texte principal |
| `employer.text.secondary` | `#5A5A7A` | Texte secondaire, labels |

---

### 2.3 Espace Extra — Ambre énergie

Routes : `/extra`, `/extra/missions`, `/extra/profile`  
Fond général : crème clair (`#FFF8ED`). Dark mode : non supporté.

| Token | Hex | Usage |
|---|---|---|
| `extra.primary` | `#F7B742` | Bouton CTA, accents |
| `extra.secondary` | `#EA5F3E` | Éléments secondaires |
| `extra.accent` | `#2E7BA6` | Contraste, liens |
| `extra.background` | `#FFF8ED` | Fond de page |
| `extra.surface` | `#FFF3D6` | Cards, surfaces secondaires |
| `extra.border` | `#EFD08C` | Bordures, séparateurs |
| `extra.text.primary` | `#503C1B` | Texte principal |
| `extra.text.secondary` | `#9A7B3F` | Texte secondaire, labels |

> **Attention :** `#F7B742` (ambre) ne doit pas être utilisé comme texte sur fond blanc — c'est un fond. Le texte sur fond ambre doit être `#503C1B`.

---

### 2.4 Espace Public — Gradient de marque

Routes : `/`, `/about`, `/blog`, `/sign-in`, `/sign-up`  
Fond : blanc `#ffffff`. Supporte dark mode.

| Zone | Couleur |
|---|---|
| Hero / header | `linear-gradient(135deg, #06041B 0%, #33335E 40%, #FDBA3B 80%, #F15A29 100%)` |
| Fond de page | `#ffffff` |
| Bouton "Je suis employeur" | `bg: #33335E`, `color: white` |
| Bouton "Je suis extra" | `bg: #F7B742`, `color: #503C1B` |
| Texte principal | `#232336` |
| Texte secondaire | `#5A5A7A` |

---

### 2.5 Couleurs sémantiques (tous espaces)

| Token | Hex | Usage |
|---|---|---|
| `*.success` | `#4BB543` | Confirmé, actif |
| `*.warning` | `#F7B742` | En attente, attention |
| `*.error` | `#EA5F3E` | Erreur, annulé |

Badges sémantiques Pro :
- Confirmé : `bg: #d4edda`, `color: #1a7a2e`
- En attente : `bg: #fff3cd`, `color: #856404`

Badges sémantiques Extra :
- Confirmé : `bg: #d4edda`, `color: #1a7a2e`
- Ouvert : `bg: #FFF3D6`, `color: #8a5a00`, `border: #EFD08C`

---

## 3. Typographie

Police : `'Segoe UI', system-ui, -apple-system, sans-serif` — pas de font externe.

| Niveau | Font-size | Font-weight | Letter-spacing | Transform | Couleur type |
|---|---|---|---|---|---|
| Display | `2.5rem` | `900` | `-0.03em` | — | `white` |
| Heading 1 | `1.875rem` | `700` | `-0.02em` | — | `white` |
| Heading 2 | `1.25rem` | `700` | — | — | `white` |
| Body | `1rem` | `400` | — | — | `#c0c0d8` / texte espace |
| Caption / Label | `0.7rem` | `600` | `0.12em` | `uppercase` | `#6060a0` |
| Code | `0.8rem` | `400` | — | — | `#FDBA3B` |

Line-height par défaut : `1.6`  
Font monospace : `'Courier New', monospace` (tokens, variables CSS)

---

## 4. Composants & Tokens

### 4.1 Border radius

| Token | Valeur | Usage |
|---|---|---|
| `sm` | `4px` — `calc(var(--radius) - 4px)` | Micro éléments |
| `md` | `6px` — `calc(var(--radius) - 2px)` | Inputs, petits boutons |
| `lg` | `8px` — `var(--radius)` | Boutons standard |
| Cards | `16px` | Toutes les cards |
| Badges / Pills | `99px` | Tags, badges, pills |

---

### 4.2 Espacement — base 4px

| Token | Valeur |
|---|---|
| `space-1` | `4px` |
| `space-2` | `8px` |
| `space-3` | `12px` |
| `space-4` | `16px` |
| `space-6` | `24px` |
| `space-8` | `32px` |
| `space-12` | `48px` |
| `space-16` | `64px` |

---

### 4.3 Motion / Transitions

| Effet | Valeur CSS |
|---|---|
| Scale au survol | `transform: scale(1.08)`, `transition: 0.2s ease-out` |
| Changement de fond | `transition: background 0.2s ease-out` |
| Focus ring | `transition: border-color 0.2s, box-shadow 0.2s` |
| Gradient animé | `background-size: 200%`, `animation: 2s ease infinite` |

---

### 4.4 Icônes

Bibliothèque : **`lucide-react`** exclusivement (déjà en dépendance).

| Contexte | Taille |
|---|---|
| Inline dans du texte | `16px` |
| Dans un bouton | `20px` |
| Standalone / accent | `24px` |

Icônes sémantiques du projet :

| Icône | Sens |
|---|---|
| ⚡ | Connexion instantanée, marque |
| 🤝 | Mission acceptée |
| 🏢 | Entreprise / espace Pro |
| 👤 | Extra candidat |
| 📍 | Localisation mission |
| 📅 | Planning mission |
| ✉️ | Invitation envoyée |
| 🔒 | Sécurité / RGPD |

---

## 5. Règles d'usage

| # | Règle | Détail |
|---|---|---|
| 1 | **Séparation des espaces** | Ne pas mélanger `employer.*` et `extra.*` dans un même espace. Le gradient de marque est réservé à l'espace public et aux éléments transversaux. |
| 2 | **CTA primaire unique** | Pro → `employer.primary` (`#33335E`). Extra → `extra.primary` (`#F7B742`). Un seul CTA primaire par vue. |
| 3 | **Accessibilité** | Ratio minimum 4.5:1 pour le texte de corps. L'ambre `#F7B742` est un fond, pas un texte sur blanc — utiliser `#503C1B` dessus. |
| 4 | **Gradient — usage restreint** | `#22345E → #FDBA3B → #F15A29` uniquement pour les zones hero, dividers, éléments de marque. Interdit sur les boutons internes. |
| 5 | **Icônes Lucide uniquement** | Ne pas introduire d'autre lib d'icônes. Respecter les tailles 16/20/24px selon le contexte. |
| 6 | **Dark mode** | Configuré via `darkMode: ["class"]`. L'espace public supporte les deux modes. Espaces Pro et Extra : mode clair uniquement pour l'instant. |

---

## 6. Récapitulatif par espace

| | Public | Pro | Extra |
|---|---|---|---|
| **Routes** | `/`, `/about`, `/blog`, `/sign-in`, `/sign-up` | `/company/**` | `/extra/**` |
| **Fond** | `#ffffff` | `#F4F7FA` | `#FFF8ED` |
| **Couleur principale** | Gradient de marque | `#33335E` | `#F7B742` |
| **CTA** | gradient ou `#33335E`/`#F7B742` | `bg: #33335E` / `color: white` | `bg: #F7B742` / `color: #503C1B` |
| **Dark mode** | Oui | Non | Non |
| **Header** | Gradient `#06041B → #F15A29` | `#06041B → #33335E` | `#503C1B → #8a6a2a` |
