You are a senior UI/UX designer, creative frontend engineer, and visual design system architect.

Your task is to redesign and implement the UI of the existing IDOLA CONTEST website.

IMPORTANT:

The project already contains:

- business requirements
- PRD
- architecture documentation
- database documentation
- Supabase architecture
- existing Idola Contest logo
- existing website functionality requirements

DO NOT change the product logic or business flow unless necessary.

This task focuses primarily on VISUAL UI/UX IMPLEMENTATION.

==================================================
REFERENCE IMAGES — MUST ANALYZE FIRST
==================================================

Before designing or coding ANY UI, inspect the project folders and locate the two supplied UI reference images.

Possible filenames include:

- "Fun Games For Smart Kids ⭐.jpeg"
- "Bright Kids Learning Center for Kids.jpeg"

or similarly named image reference files.

Open and visually analyze BOTH images.

Treat these reference images as the primary visual direction.

DO NOT merely create a generic "kids website".

The result must clearly feel visually inspired by the two supplied references.

Do not copy their brand names, written content, mascots, logos, or proprietary characters.

Instead reproduce their:

- visual hierarchy
- layout rhythm
- card shapes
- section composition
- rounded geometry
- spacing philosophy
- button style
- glossy 3D feeling
- colorful palettes
- depth
- shadows
- playful decorative objects
- kid-oriented interaction patterns
- typography proportions
- visual density
- responsive behavior

Adapt everything to IDOLA CONTEST.

==================================================
UNDERSTANDING OF REFERENCE IMAGE 1
==================================================

Reference Image 1 represents a playful gamified children's application/dashboard.

Important characteristics to reproduce:

- very colorful UI
- saturated sky blue background
- blue → purple → pink gradients
- large bubbly typography
- chunky 3D headline lettering
- strong white outlines around important elements
- smooth rounded corners
- almost no sharp corners
- glossy icon surfaces
- floating decorative stars
- playful 3D visual elements
- layered cards
- game-like UI
- large touch targets
- pill-shaped containers
- card grids
- icons placed inside circular/rounded-square containers
- multiple small colorful categories
- strong visual hierarchy
- white/pastel content containers over colorful background
- soft dimensional shadows
- subtle inner highlights
- soft glow
- large friendly icons
- playful counters and badges
- mobile-first composition
- bottom navigation styled like a game application
- highly approachable UI for parents and children

Use this reference mainly for:

- buttons
- badges
- cards
- competition tiles
- participant status
- registration success UI
- countdown
- admin statistics where appropriate
- mobile UI
- category icons
- achievement cards
- finalis cards
- microinteractions

==================================================
UNDERSTANDING OF REFERENCE IMAGE 2
==================================================

Reference Image 2 represents a polished children's learning-center landing page.

Important characteristics to reproduce:

- clean desktop website structure
- strong sky-blue header/hero
- large organic white wave separating sections
- colorful 3D illustration integrated into hero
- modern kid-friendly navigation
- compact navbar
- yellow primary CTA
- dark blue typography
- colorful emphasized keywords
- alternating white and blue sections
- soft pastel cards
- organic section edges
- rounded cards
- lots of whitespace
- cartoon stars and decorative elements around section edges
- characters partially entering sections from outside the content grid
- natural scenery aesthetic
- clouds
- trees
- grass
- playful nature objects
- structured information architecture
- friendly but professional
- visually dense enough for children while still readable for parents
- pastel yellow, pastel pink, pastel blue, pastel green information cards
- horizontal feature cards
- consistent section rhythm
- large illustrated CTA blocks
- professional footer

Use this reference mainly for:

- page architecture
- navbar
- hero composition
- section rhythm
- wavy section separators
- large illustration positioning
- feature sections
- prize section
- competition sections
- FAQ area
- footer
- desktop experience

==================================================
DESIGN PHILOSOPHY
==================================================

The IDOLA CONTEST website must feel like:

"An Indonesian national children's creative competition platform designed like a polished premium kids edutainment brand."

It must NOT feel like:

- a government website
- a fintech dashboard
- a plain SaaS application
- a corporate landing page
- a minimalist adult website
- a generic Bootstrap template
- a cheap birthday invitation
- a cluttered children's poster

The target users are:

PRIMARY:
Parents, especially mothers registering children.

SECONDARY:
Children who may see the website together with their parents.

Therefore the design must be:

- fun for children
- trustworthy for mothers
- visually rich
- easy to navigate
- extremely mobile friendly
- professional
- cheerful
- colorful
- reassuring

==================================================
BRAND IDENTITY
==================================================

Brand:

IDOLA CONTEST

Instagram:

@idola.contest

Tagline:

"Saatnya Si Kecil Menjadi Idola!"

Use the EXISTING logo from the project.

Search folders for:

"LOGO IDOLA CONTEST"

Do NOT redesign the logo.

The website design must visually match the existing logo.

==================================================
CORE COLOR SYSTEM
==================================================

Use a candy-color system inspired by the supplied references.

Primary:

Sky Blue
#199DF2 approximately

Deep Blue
#136DD8 approximately

Candy Pink
#FF4F9A approximately

Sunshine Yellow
#FFC92E approximately

Purple
#9558EB approximately

Mint Green
#54D178 approximately

White
#FFFFFF

Soft backgrounds:

Pastel Blue
Pastel Pink
Pastel Yellow
Pastel Purple
Pastel Green

Dark text:

Deep Navy Blue
around #164079

Do not treat these hex values as rigid.
Visually sample and harmonize colors from the reference images.

==================================================
BACKGROUND SYSTEM
==================================================

Avoid large empty white rectangles.

Sections should feel illustrated and layered.

Use combinations of:

- blue sky backgrounds
- white organic waves
- soft clouds
- subtle stars
- light confetti
- decorative sparkles
- small colorful circles
- abstract kid-friendly shapes

Use CSS or SVG for organic section separators.

Example:

blue hero
↓
curved white wave
↓
white content section
↓
pastel cards
↓
blue illustrated section
↓
organic white curve
↓
next section

Do not use straight horizontal separators everywhere.

==================================================
TYPOGRAPHY
==================================================

Typography should strongly resemble the references.

HEADLINES:

Use a rounded bold display font.

Preferred options:

- Fredoka
- Baloo 2
- Nunito ExtraBold
- Lilita One

Use large, chunky headings.

For major promotional headings, allow individual words to use different colors.

Example:

"SAATNYA"
blue

"SI KECIL"
pink

"BERSINAR!"
yellow

Do not use rainbow colors on every sentence.

BODY:

Use:

- Nunito
  or
- Poppins

Body content must remain highly readable for parents.

==================================================
3D TYPOGRAPHY
==================================================

For selected hero phrases or promotional labels, recreate the reference's soft 3D bubble text effect.

Use:

- bold rounded letters
- subtle extrusion
- highlight at top
- darker color underneath
- soft shadow
- optional white border

Do NOT use extreme 3D effects everywhere.

Hero and important campaign text only.

==================================================
SHADOW SYSTEM
==================================================

Avoid standard dark Material Design shadows.

Use:

- soft blue shadows
- soft purple shadows
- translucent pink shadows
- diffuse floating shadows

Cards should appear:

soft
floating
friendly

Example:

box-shadow:
0 12px 28px rgba(70,100,180,0.14)

Primary buttons may use:

0 7px 0 darker-color

to create the toy-like raised-button feeling.

==================================================
BORDER RADIUS
==================================================

The references rely heavily on rounded geometry.

Use approximately:

Small:
14–18px

Cards:
22–32px

Large containers:
32–44px

Pills:
9999px

Avoid square cards.

==================================================
NAVBAR
==================================================

Desktop navbar inspired strongly by Reference 2.

Structure:

[Idola Contest Logo]

Home
Lomba
Galeri
Timeline
Hadiah
FAQ

Instagram Icon

[DAFTAR SEKARANG →]

Navbar behavior:

- floating slightly above hero
- blue background area
- transparent or lightly translucent
- white nav text
- active link with yellow underline or indicator
- CTA yellow
- rounded pill CTA

On mobile:

- compact header
- logo
- hamburger button
- CTA may remain visible

Mobile menu:

large
rounded
colorful
full-screen/large-sheet feel

==================================================
HERO SECTION
==================================================

The homepage HERO must strongly resemble the visual composition of Reference 2.

Desktop:

LEFT:

- Season badge
- main headline
- supportive copy
- CTA buttons
- countdown

RIGHT:

- large playful 3D illustration composition

Use the Idola Contest theme:

- camera
- polaroid photos
- color pencils
- crayons
- coloring palette
- stars
- clouds
- trophy
- medals

Do not randomly create mascots unless mascot assets exist.

Prefer using the Idola Contest logo and competition-themed illustrated objects.

Suggested hero text:

Badge:

"🌟 IDOLA CONTEST — SEASON 1"

Headline:

"Saatnya Si Kecil
Menjadi Idola!"

Make:

"Si Kecil"
Candy Pink

"Idola!"
Sunshine Yellow

Supporting text:

"Kompetisi kreatif anak Indonesia untuk menunjukkan senyum,
keberanian, dan karya terbaik si kecil."

Buttons:

Primary yellow:
"Daftar Sekarang →"

Secondary white:
"Lihat Finalis"

Hero background:

rich sky blue gradient

Add:

- clouds
- small stars
- sparkles
- soft decorative objects

Bottom hero separator:

LARGE ORGANIC WHITE WAVE

Do not make the hero a standard rectangle.

==================================================
COUNTDOWN
==================================================

Countdown should feel like a mini game-status widget from Reference 1.

Example:

Pendaftaran ditutup dalam

[ 14 ]
Hari

[ 06 ]
Jam

[ 22 ]
Menit

[ 19 ]
Detik

Each counter:

- rounded tile
- white surface
- colored number
- subtle glossy highlight
- floating shadow

Add badge:

"🔥 KUOTA TERBATAS"

Do not fake quota data.

==================================================
COMPETITION CARDS
==================================================

Create two large feature cards.

Card 1:

LOMBA FOTOGENIK

Visual:

- camera
- polaroid
- sparkle
- profession costume / themed object

Color family:
blue / pink

Card 2:

LOMBA MEWARNAI

Visual:

- colored pencils
- crayons
- palette
- worksheet

Color family:
yellow / purple / mint

Cards must be:

- very rounded
- dimensional
- visually playful
- clear CTA
- large illustration
- tag showing eligible levels

Do NOT make them plain SaaS cards.

==================================================
CATEGORY NAVIGATION
==================================================

Inspired by the category row in Reference 1.

Create icon tiles for:

Preschool
PAUD
TK
SD 1–2
SD 3–4
SD 5–6

Each:

circular / rounded-square icon bubble
different pastel color

Example icons:

Preschool:
star/toy

PAUD:
blocks

TK:
crayon

SD 1–2:
book

SD 3–4:
pencil

SD 5–6:
trophy/star

This section should feel tappable.

==================================================
WHY IDOLA CONTEST
==================================================

Inspired by the horizontal feature strip in Reference 2.

Four rounded features:

🌟 Wadah Kreativitas

🏆 Penghargaan Nasional

🎨 Kompetisi Seru

🔒 Aman untuk Anak

Card style:

white container
soft shadow
small colorful icon

Desktop:
horizontal

Mobile:
2x2 grid

==================================================
COLORING PERSONALIZATION SECTION
==================================================

This is a critical selling point.

Create a special illustrated section.

Blue or purple background.

Title:

"Worksheet yang Dibuat Khusus Untuk Si Kecil!"

Explain:

For coloring participants, the worksheet "Cita Citaku"
is personalized using the participant's face/character
and their dream profession.

Visual:

LEFT:
personalized worksheet mockup

RIGHT:
text / or reverse depending layout

Use:

- pencils
- palette
- stars
- colorful doodles

Add badge:

"✨ Lebih Personal!"

==================================================
PRIZE SECTION
==================================================

Do NOT use a plain list.

Design it similar to collectible rewards from Reference 1.

Headline:

"Hadiah Premium untuk Para Idola!"

Show individual reward cards:

🏆
Piala Gold Marmer

🥇
Medali Juara Nasional

📜
Piagam Penghargaan

⭐
Plakat Marmer

🎨
Worksheet Unlimited

Each should look like a reward unlock card.

Use:

- floating cards
- gradients
- stars
- tiny shine effect

Optional:
one large gift box illustration.

==================================================
TIMELINE
==================================================

Make the competition timeline visually resemble a game-level journey.

Desktop:

horizontal path

21 SEP
Pendaftaran Dibuka

06 OCT
Pendaftaran Ditutup

07 OCT
Penilaian

08 OCT
Pengumuman

09–12 OCT
Penyiapan Hadiah

13 OCT
Pengiriman

Use:

- connected curved line
- colored milestone circles
- icons
- stars
- trophy
- package icon

Mobile:
vertical playful timeline.

==================================================
REGISTRATION STEPS
==================================================

Design as four large playful numbered cards.

1
Daftar

2
Bayar Registrasi

3
Kirim Karya

4
Jadi Finalis

Use toy-like number bubbles.

==================================================
FINALIST GALLERY
==================================================

The gallery should visually borrow from the "POPULAR GAMES" section in Reference 1.

Cards:

large artwork/photo
badge
name
category
city

Card image dominates.

Rounded 24–28px.

Add:

FINALIS

as floating badge.

Cards should be colorful but the actual participant photo remains the focus.

Use masonry/grid responsively.

Desktop:
3–4 columns

Tablet:
2–3

Mobile:
2 columns where comfortable, otherwise 1.

==================================================
FINALIST PROFILE
==================================================

Make it feel like an achievement card.

Top:

"🌟 FINALIS IDOLA CONTEST"

Large approved photo/artwork.

Below:

Name
Competition
Category
City
Province

Include decorative stars.

CTA:

"Bagikan ke WhatsApp"

Secondary:

"Salin Link"

Optional visual:

certificate-like profile panel.

==================================================
REGISTRATION FORM UI
==================================================

Do NOT make it look like a boring corporate form.

Place the form inside a large rounded white panel.

Background:
soft sky / cloud illustrations.

Top:

"Yuk Daftarkan Si Kecil! 🌟"

Step progress:

1 Data Anak
2 Orang Tua
3 Alamat
4 Foto
5 Konfirmasi

Use large colorful progress bubbles.

Input fields:

- 16–18px radius
- white
- clear border
- comfortable touch height
- large labels
- helper text

Dropdowns:
custom visually styled but accessible.

Focus:

blue/purple glow.

Validation:

friendly red/pink warning.

Success:
green/mint.

==================================================
UPLOAD PHOTO UI
==================================================

Large drag/drop/tap zone.

Visual:

camera icon
cloud upload

Copy:

"Upload Foto Si Kecil"

If file >2MB:

Display a colorful warning card.

Title:

"Ups! Fotonya Terlalu Besar 📸"

Button:

"Kompres Foto Otomatis"

Use playful progress indicator during compression.

==================================================
STATUS CHECK PAGE
==================================================

Make this page resemble a small game achievement/status page inspired by Reference 1.

Input registration code.

When PENDING:

yellow / orange status card.

When PAID:

large success card
green / blue
confetti
star
check badge

Message:

"Yeay! Pembayaranmu Sudah Terverifikasi!"

Show:

registration code
name
competition
category

Then CTA.

Do not expose sensitive information.

==================================================
ADMIN UI
==================================================

Admin area should remain professional.

Do NOT make the admin dashboard excessively childish.

Use the same color system but reduce decorative elements.

Admin style:

- light background
- rounded white cards
- blue/purple navigation
- colored metric cards
- clean table
- colorful status badges

Metric cards can borrow gamified visual language from Reference 1.

Examples:

Total Peserta
Paid
Pending
Karya Masuk
Approved

Do not use cartoon illustrations everywhere in admin.

==================================================
BUTTON SYSTEM
==================================================

Primary:

yellow background
navy/dark-blue text
large rounded pill
subtle raised shadow

Secondary:

white background
blue text
thin blue border

Pink action:

Candy Pink
white text

Purple action:

Purple
white

Green:

success only

Buttons must feel:

thick
tactile
touchable

Primary buttons may slightly lift on hover.

Hover:

translateY(-2px)

Active:

translateY(1px)

==================================================
ICON SYSTEM
==================================================

Use:

Lucide icons for ordinary interface actions.

For brand/social:

use recognizable official Instagram and WhatsApp logos.

For kid feature icons:

create/custom use colorful 3D-style icons when assets are available.

Do not put generic black icons everywhere.

==================================================
DECORATIVE SYSTEM
==================================================

Build reusable components:

<StarDecoration />
<CloudDecoration />
<SparkleDecoration />
<ColorBlob />
<WaveDivider />
<FloatingSticker />

Use them carefully.

Desktop:
decorations may float beyond container edges.

Mobile:
reduce quantity.

Never interfere with text readability.

==================================================
SECTION WIDTH
==================================================

Desktop max width:

approximately 1180–1280px.

Content should not stretch edge-to-edge.

Main sections:
generous vertical padding.

Desktop:
80–120px

Mobile:
56–72px

==================================================
RESPONSIVE DESIGN
==================================================

MOBILE IS EXTREMELY IMPORTANT.

Most Idola Contest traffic will come from smartphones.

Mobile experience should visually feel closer to Reference Image 1.

Desktop experience should visually feel closer to Reference Image 2.

This distinction is intentional.

Desktop:

- wide illustrated landing page
- large hero
- horizontal layouts

Mobile:

- gamified cards
- stacked sections
- large touch targets
- compact decorative UI
- sticky CTA

==================================================
MOBILE STICKY CTA
==================================================

At bottom of public mobile screens:

large rounded bar/button:

"🌟 Daftar Sekarang"

It must be easy to access with one thumb.

Do not obscure important content.

==================================================
MICROINTERACTIONS
==================================================

Implement subtle:

- floating stars
- slow cloud movement
- card hover lift
- button press
- small sparkle
- progress animation
- confetti after successful payment verification
- successful form checkmark

Use CSS first.

If using Framer Motion:
keep bundle usage controlled.

Do NOT make the website feel chaotic.

==================================================
ANIMATION PRINCIPLE
==================================================

Animation should feel like:

"gentle playful life"

NOT:

"constant carnival movement"

Decorative stars:
very subtle float.

Hero objects:
gentle 3–6 second floating cycle.

Buttons:
quick.

Confetti:
only on successful actions.

==================================================
WHITE SPACE
==================================================

Although the design is colorful, do not overcrowd the interface.

Reference Image 2 has good professional spacing.

Maintain:

- breathing room
- strong hierarchy
- clear reading order
- consistent grid

Parents must be able to scan information quickly.

==================================================
FOOTER
==================================================

Create a large blue footer inspired by Reference 2.

Top edge:
organic wave.

Include:

Idola Contest logo

Short description:
"Wadah kreativitas anak Indonesia untuk berkarya,
berani tampil, dan bersinar."

Quick links

Lomba
Galeri
Timeline
FAQ
Syarat & Ketentuan
Kebijakan Privasi

Social:

Instagram @idola.contest

WhatsApp admin

Include small decorative:

stars
clouds
pencils

Do not overcrowd footer.

==================================================
DESIGN TOKENS
==================================================

Create reusable CSS variables/tokens.

Example:

--idola-blue
--idola-blue-dark
--idola-pink
--idola-yellow
--idola-purple
--idola-green

--radius-card
--radius-panel
--shadow-soft
--shadow-button
--max-content

Do not scatter arbitrary values everywhere.

==================================================
COMPONENTS TO CREATE
==================================================

Build reusable components such as:

BrandNavbar
HeroSection
CountdownCard
CompetitionCard
CategoryBubble
FeatureStrip
PersonalizedWorksheetSection
PrizeCard
CompetitionTimeline
RegistrationStepCard
FinalistCard
FinalistGallery
InfoBanner
FAQSection
Footer

UI primitives:

IdolaButton
IdolaBadge
IdolaCard
BubbleIcon
WaveDivider
SectionHeading
FloatingDecoration
StatusBadge
FormField
ImageUploader

==================================================
QUALITY BAR
==================================================

The website should immediately give this impression:

"Wow, this looks like a serious national children's event."

and simultaneously:

"This looks fun enough for my child."

The final website must visually resemble the supplied references
much more than a standard modern SaaS landing page.

When making a visual decision, repeatedly compare it against BOTH
reference images.

Ask:

- Is this rounded enough?
- Is this colorful enough?
- Does this feel dimensional?
- Does this still feel professional?
- Does this look like a children's brand?
- Would this component visually fit inside either supplied reference?
- Does the desktop feel like Reference 2?
- Does mobile feel like Reference 1?

If the answer is no, refine the design.

==================================================
IMPORTANT: DO NOT
==================================================

Do NOT:

- use generic Tailwind UI layouts
- use shadcn default theme without heavy customization
- produce gray SaaS cards
- use sharp corners
- use tiny text
- use excessive dark themes
- use flat plain buttons
- make everything white
- use generic gradients unrelated to references
- make the entire UI minimalist
- duplicate the reference brand/characters
- redesign the Idola Contest logo
- sacrifice accessibility
- sacrifice mobile performance

==================================================
IMPLEMENTATION PROCESS
==================================================

PHASE 1:

Analyze both reference images.

Document briefly:

- palette
- typography
- shapes
- cards
- hero composition
- spacing
- visual hierarchy

PHASE 2:

Create Idola Contest design tokens and global component system.

PHASE 3:

Build homepage first.

Do NOT proceed to all other pages until the homepage visually establishes
the correct design language.

PHASE 4:

Apply the design system to:

- registration
- status
- competition pages
- gallery
- finalist profile
- results
- admin

PHASE 5:

Check desktop and mobile side-by-side.

Desktop visual reference:
Bright Kids Learning Center image.

Mobile visual reference:
Fun Games For Smart Kids image.

PHASE 6:

Run:

lint
typecheck
build

Fix all issues.

Do not declare completion if the website still looks like a generic template.

==================================================
FINAL GOAL
==================================================

Create an original IDOLA CONTEST interface using the supplied images as
strong visual references.

The result should combine:

REFERENCE 2:
professional kids landing-page structure

-

REFERENCE 1:
colorful gamified component styling

-

IDOLA CONTEST:
camera, photography, coloring, stars, awards, competition,
and the existing Idola Contest logo.

Final feeling:

COLORFUL
FUN
3D
SOFT
PREMIUM
KID FRIENDLY
TRUSTWORTHY FOR PARENTS
HIGHLY MOBILE FRIENDLY
