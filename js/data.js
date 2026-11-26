/* ==========================================================================
   Germle – Mikroben-Datenbank
   Kuratiert: jede wichtige ökologische Gilde und jeder Nährbodentyp ist
   vertreten. Neue Einträge einfach unten im Array ergänzen.

   Format: [Lateinischer Name, Deutscher Name, Typ, Gilde, Nährboden,
            Sauerstoff, Temperatur, Habitat, Form, Seltenheit 1–5, Fakt]
   Typ: B = Bakterium, A = Archaeon, P = Pilz, V = Virus
   ========================================================================== */
'use strict';

const GERMLE_DATA = (() => {

  const TYPES = { B: 'Bakterium', A: 'Archaeon', P: 'Pilz', V: 'Virus' };

  /* Gilde -> Gildengruppe (Sammelset) */
  const GUILDS = {
    'Ammoniakoxidierer': 'Stickstoff', 'Nitritoxidierer': 'Stickstoff', 'Comammox': 'Stickstoff',
    'Anammox': 'Stickstoff', 'Denitrifizierer': 'Stickstoff', 'Stickstofffixierer': 'Stickstoff',
    'Sulfatreduzierer': 'Schwefel', 'Schwefeloxidierer': 'Schwefel', 'Kabelbakterien': 'Schwefel',
    'Eisenoxidierer': 'Eisen & Metalle', 'Eisenreduzierer': 'Eisen & Metalle',
    'Manganoxidierer': 'Eisen & Metalle', 'Magnetotaktische': 'Eisen & Metalle',
    'Methanogene': 'Methan & Gase', 'Methanotrophe': 'Methan & Gase', 'Methylotrophe': 'Methan & Gase',
    'Wasserstoffoxidierer': 'Methan & Gase',
    'Cyanobakterien': 'Licht', 'Purpurbakterien': 'Licht', 'Grüne Schwefelbakterien': 'Licht',
    'Grüne Nichtschwefelbakterien': 'Licht', 'Heliobakterien': 'Licht',
    'Zersetzer': 'Abbau', 'Schadstoffabbauer': 'Abbau', 'Antibiotikabildner': 'Abbau',
    'Räuber': 'Abbau', 'Heterotrophe': 'Abbau', 'Phosphatspeicherer': 'Abbau',
    'Milchsäurebakterien': 'Gärung', 'Essigsäurebakterien': 'Gärung', 'Gärer': 'Gärung', 'Gärhefen': 'Gärung',
    'Darmflora': 'Symbiose', 'Hautflora': 'Symbiose', 'Mundflora': 'Symbiose', 'Endosymbionten': 'Symbiose',
    'Leuchtsymbionten': 'Symbiose', 'Mykorrhiza': 'Symbiose', 'Flechtenpilze': 'Symbiose',
    'Humanpathogene': 'Parasiten', 'Pflanzenpathogene': 'Parasiten', 'Insektenpathogene': 'Parasiten',
    'Nematodenfänger': 'Parasiten', 'Hautpilze': 'Parasiten', 'Tierpathogene': 'Parasiten',
    'Halophile': 'Extremophile', 'Thermophile': 'Extremophile', 'Psychrophile': 'Extremophile',
    'Acidophile': 'Extremophile', 'Strahlenresistente': 'Extremophile', 'Asgard-Archaeen': 'Extremophile',
    'Weißfäulepilze': 'Holz & Fäule', 'Braunfäulepilze': 'Holz & Fäule', 'Saprotrophe': 'Holz & Fäule',
    'Schimmelpilze': 'Holz & Fäule', 'Schleimpilze': 'Holz & Fäule',
    'Bakteriophagen': 'Viren', 'Archaeenviren': 'Viren', 'Pflanzenviren': 'Viren', 'Humanviren': 'Viren',
    'Tierviren': 'Viren', 'Riesenviren': 'Viren', 'Virophagen': 'Viren', 'Algenviren': 'Viren',
    'Pilzviren': 'Viren', 'Insektenviren': 'Viren', 'Viroide': 'Viren',
  };

  /* Nährboden -> Gruppe */
  const SUBSTRATES = {
    'Ammonium': 'Stickstoff', 'Nitrit': 'Stickstoff', 'Nitrat': 'Stickstoff',
    'Luftstickstoff': 'Stickstoff', 'Harnstoff': 'Stickstoff',
    'Sulfat': 'Schwefel', 'Sulfid': 'Schwefel', 'Schwefel': 'Schwefel',
    'Eisen(II)': 'Metalle', 'Eisen(III)': 'Metalle', 'Mangan': 'Metalle',
    'Methan': 'Gase & C1', 'Methanol': 'Gase & C1', 'CO₂ + H₂': 'Gase & C1',
    'Wasserstoff': 'Gase & C1', 'Acetat': 'Gase & C1',
    'Licht': 'Licht',
    'Zucker': 'Gelöste Organik', 'Laktose': 'Gelöste Organik', 'Stärke': 'Gelöste Organik',
    'Ethanol': 'Gelöste Organik', 'Laktat': 'Gelöste Organik', 'Aminosäuren': 'Gelöste Organik',
    'Oxalat': 'Gelöste Organik', 'Mucin': 'Gelöste Organik', 'Ballaststoffe': 'Gelöste Organik',
    'Gelöste Organik': 'Gelöste Organik', 'Fette': 'Gelöste Organik',
    'Cellulose': 'Biomasse', 'Chitin': 'Biomasse', 'Lignin': 'Biomasse', 'Holz': 'Biomasse',
    'Keratin': 'Biomasse', 'Humus': 'Biomasse', 'Talg': 'Biomasse', 'Dung': 'Biomasse',
    'Pflanzensaft': 'Lebender Wirt', 'Wurzelexsudate': 'Lebender Wirt', 'Wirtsgewebe': 'Lebender Wirt',
    'Insekten': 'Lebender Wirt', 'Fadenwürmer': 'Lebender Wirt', 'Beutebakterien': 'Lebender Wirt',
    'Kohlenwasserstoffe': 'Schadstoffe', 'Plastik (PET)': 'Schadstoffe', 'Chlorverbindungen': 'Schadstoffe',
    'Salzlake': 'Mineralien', 'Phosphat': 'Mineralien',
    'Wirt: Bakterium': 'Virenwirt', 'Wirt: Archaeon': 'Virenwirt', 'Wirt: Pflanze': 'Virenwirt',
    'Wirt: Tier': 'Virenwirt', 'Wirt: Mensch': 'Virenwirt', 'Wirt: Amöbe': 'Virenwirt',
    'Wirt: Alge': 'Virenwirt', 'Wirt: Pilz': 'Virenwirt', 'Wirt: Insekt': 'Virenwirt',
    'Wirt: Riesenvirus': 'Virenwirt', 'Wirt: Archaeon-Zelle': 'Virenwirt',
  };

  const HABITATS = {
    'Meer': 'Wasser', 'Süßwasser': 'Wasser', 'Sediment': 'Wasser', 'Kläranlage': 'Wasser',
    'Darm': 'Körper', 'Magen': 'Körper', 'Haut': 'Körper', 'Mund': 'Körper',
    'Atemwege': 'Körper', 'Blut': 'Körper',
    'Boden': 'Land', 'Pflanze': 'Land', 'Holz': 'Land', 'Kompost': 'Land', 'Dung': 'Land',
    'Höhle': 'Land', 'Wüste': 'Land', 'Felsen': 'Land',
    'Heiße Quelle': 'Extrem', 'Tiefsee-Schlot': 'Extrem', 'Salzsee': 'Extrem', 'Eis': 'Extrem',
    'Saures Grubenwasser': 'Extrem', 'Tiefengestein': 'Extrem', 'Reaktor': 'Extrem',
    'Lebensmittel': 'Zivilisation', 'Haushalt': 'Zivilisation',
    'Gliederfüßer': 'Tierwirt', 'Tier': 'Tierwirt',
  };

  const FORMS = {
    'Kokke': 'Prokaryot', 'Stäbchen': 'Prokaryot', 'Spirille': 'Prokaryot',
    'Filament': 'Prokaryot', 'Quadrat': 'Prokaryot',
    'Hefe': 'Pilz', 'Hyphe': 'Pilz', 'Fruchtkörper': 'Pilz', 'Spore': 'Pilz',
    'Flechte': 'Pilz', 'Plasmodium': 'Pilz',
    'Kopf-Schwanz': 'Virion', 'Ikosaeder': 'Virion', 'Helikal': 'Virion', 'Hülle': 'Virion',
    'Faden': 'Virion', 'Spindel': 'Virion', 'Amphore': 'Virion', 'Riesenkapsid': 'Virion',
    'Flasche': 'Virion', 'Kapsidlos': 'Virion', 'Projektil': 'Virion', 'Stabkapsid': 'Virion',
  };

  const OXYGEN = ['aerob', 'mikroaerophil', 'fakultativ', 'aerotolerant', 'anaerob'];
  const TEMPS = ['psychrophil', 'mesophil', 'thermophil', 'hyperthermophil'];
  const RARITY = [null,
    { name: 'Häufig', xp: 10, weight: 6, color: '#9fb3a8' },
    { name: 'Ungewöhnlich', xp: 20, weight: 5, color: '#4fd18b' },
    { name: 'Selten', xp: 40, weight: 4, color: '#4fa8ff' },
    { name: 'Episch', xp: 80, weight: 2.5, color: '#c27bff' },
    { name: 'Legendär', xp: 160, weight: 1.2, color: '#ffc845' },
  ];

  const RAW = [
  /* ===================== STICKSTOFFKREISLAUF ===================== */
  ['Nitrosomonas europaea', 'Ammoniakoxidierer', 'B', 'Ammoniakoxidierer', 'Ammonium', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 2, 'Oxidiert Ammoniak zu Nitrit – der erste Schritt der Nitrifikation.'],
  ['Nitrosospira multiformis', 'Spiraliger Nitrifizierer', 'B', 'Ammoniakoxidierer', 'Ammonium', 'aerob', 'mesophil', 'Boden', 'Spirille', 3, 'Einer der häufigsten Ammoniakoxidierer in Ackerböden.'],
  ['Nitrosococcus oceani', 'Meeres-Nitrifizierer', 'B', 'Ammoniakoxidierer', 'Ammonium', 'aerob', 'mesophil', 'Meer', 'Kokke', 3, 'Erster aus dem offenen Ozean isolierter Ammoniakoxidierer.'],
  ['Nitrosopumilus maritimus', 'Meeres-Archaeon', 'A', 'Ammoniakoxidierer', 'Ammonium', 'aerob', 'mesophil', 'Meer', 'Stäbchen', 3, 'Entdeckt in einem Aquarium in Seattle – seine Verwandten gehören zu den häufigsten Zellen im Ozean.'],
  ['Nitrososphaera viennensis', 'Wiener Boden-Archaeon', 'A', 'Ammoniakoxidierer', 'Ammonium', 'aerob', 'mesophil', 'Boden', 'Kokke', 4, 'Aus Gartenerde in Wien isoliert.'],
  ['Nitrobacter winogradskyi', 'Nitritoxidierer', 'B', 'Nitritoxidierer', 'Nitrit', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 2, 'Benannt nach Sergei Winogradsky, dem Entdecker der Chemolithotrophie.'],
  ['Nitrospira moscoviensis', 'Moskauer Nitrospira', 'B', 'Nitritoxidierer', 'Nitrit', 'aerob', 'mesophil', 'Süßwasser', 'Spirille', 3, 'Aus einer Moskauer Heizungsleitung isoliert.'],
  ['Nitrospira inopinata', 'Comammox-Bakterium', 'B', 'Comammox', 'Ammonium', 'aerob', 'thermophil', 'Süßwasser', 'Spirille', 4, '2015 entdeckt: oxidiert Ammoniak allein komplett bis zu Nitrat.'],
  ['Candidatus Brocadia anammoxidans', 'Anammox-Bakterium', 'B', 'Anammox', 'Ammonium', 'anaerob', 'mesophil', 'Kläranlage', 'Kokke', 4, 'Verbindet Ammonium und Nitrit direkt zu Stickstoffgas – in Kläranlagen entdeckt.'],
  ['Candidatus Kuenenia stuttgartiensis', 'Stuttgarter Anammox', 'B', 'Anammox', 'Ammonium', 'anaerob', 'mesophil', 'Kläranlage', 'Kokke', 4, 'Besitzt ein eigenes Organell, das Anammoxosom, in dem Hydrazin entsteht.'],
  ['Candidatus Scalindua profunda', 'Tiefen-Anammox', 'B', 'Anammox', 'Ammonium', 'anaerob', 'mesophil', 'Meer', 'Kokke', 4, 'Anammox im Meer erzeugt einen großen Teil des Stickstoffverlusts der Ozeane.'],
  ['Paracoccus denitrificans', 'Denitrifizierer', 'B', 'Denitrifizierer', 'Nitrat', 'fakultativ', 'mesophil', 'Boden', 'Kokke', 2, 'Seine Atmungskette ähnelt stark der von Mitochondrien.'],
  ['Pseudomonas stutzeri', 'Stutzers Pseudomonade', 'B', 'Denitrifizierer', 'Nitrat', 'fakultativ', 'mesophil', 'Boden', 'Stäbchen', 2, 'Baut Nitrat bis zu Stickstoffgas ab und kann selbst Stickstoff fixieren.'],
  ['Rhizobium leguminosarum', 'Erbsen-Knöllchenbakterium', 'B', 'Stickstofffixierer', 'Luftstickstoff', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 2, 'Lebt in Wurzelknöllchen von Erbsen und Klee und liefert ihnen Stickstoff.'],
  ['Bradyrhizobium japonicum', 'Soja-Knöllchenbakterium', 'B', 'Stickstofffixierer', 'Luftstickstoff', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 2, 'Symbiont der Sojabohne – wird als Saatgut-Impfmittel verkauft.'],
  ['Sinorhizobium meliloti', 'Luzerne-Knöllchenbakterium', 'B', 'Stickstofffixierer', 'Luftstickstoff', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 3, 'Modellorganismus für die Symbiose mit Luzerne.'],
  ['Azotobacter vinelandii', 'Freilebender N-Fixierer', 'B', 'Stickstofffixierer', 'Luftstickstoff', 'aerob', 'mesophil', 'Boden', 'Kokke', 2, 'Atmet extrem schnell, um sein Nitrogenase-Enzym vor Sauerstoff zu schützen.'],
  ['Frankia alni', 'Erlen-Frankia', 'B', 'Stickstofffixierer', 'Luftstickstoff', 'aerob', 'mesophil', 'Pflanze', 'Filament', 3, 'Fädiges Actinobakterium in den Wurzelknöllchen der Erle.'],
  ['Azospirillum brasilense', 'Brasilianisches Azospirillum', 'B', 'Stickstofffixierer', 'Luftstickstoff', 'mikroaerophil', 'mesophil', 'Boden', 'Spirille', 3, 'Fördert Wurzelwachstum von Gräsern und Getreide.'],
  ['Clostridium pasteurianum', 'Pasteurs Clostridium', 'B', 'Stickstofffixierer', 'Luftstickstoff', 'anaerob', 'mesophil', 'Boden', 'Stäbchen', 3, 'Einer der ersten bekannten anaeroben Stickstofffixierer.'],
  ['Gluconacetobacter diazotrophicus', 'Zuckerrohr-Symbiont', 'B', 'Stickstofffixierer', 'Luftstickstoff', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 4, 'Lebt im Inneren von Zuckerrohr und versorgt es mit Stickstoff.'],
  ['Trichodesmium erythraeum', 'Seesägespäne', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Meer', 'Filament', 3, 'Seine Blüten färben das Rote Meer – fixiert riesige Mengen Stickstoff.'],

  /* ===================== SCHWEFELKREISLAUF ===================== */
  ['Desulfovibrio vulgaris', 'Gemeiner Sulfatreduzierer', 'B', 'Sulfatreduzierer', 'Sulfat', 'anaerob', 'mesophil', 'Sediment', 'Spirille', 2, 'Riecht nach faulen Eiern: Er atmet Sulfat und produziert Schwefelwasserstoff.'],
  ['Desulfobacter postgatei', 'Postgates Sulfatreduzierer', 'B', 'Sulfatreduzierer', 'Sulfat', 'anaerob', 'mesophil', 'Sediment', 'Stäbchen', 3, 'Benannt nach John Postgate, dem Pionier der Sulfatreduzierer-Forschung.'],
  ['Desulfobulbus propionicus', 'Propionat-Sulfatreduzierer', 'B', 'Sulfatreduzierer', 'Sulfat', 'anaerob', 'mesophil', 'Sediment', 'Stäbchen', 3, 'Naher Verwandter der Kabelbakterien.'],
  ['Desulforudis audaxviator', 'Kühner Reisender', 'B', 'Sulfatreduzierer', 'Sulfat', 'anaerob', 'thermophil', 'Tiefengestein', 'Stäbchen', 5, 'Lebt allein 2,8 km tief in einer Goldmine – ein Ökosystem aus nur einer Art. Name aus Jules Vernes „Reise zum Mittelpunkt der Erde“.'],
  ['Archaeoglobus fulgidus', 'Leuchtende Urkugel', 'A', 'Sulfatreduzierer', 'Sulfat', 'anaerob', 'hyperthermophil', 'Tiefsee-Schlot', 'Kokke', 4, 'Leuchtet unter UV-Licht blaugrün und lebt bei über 80 °C.'],
  ['Beggiatoa alba', 'Weiße Schwefelfaden', 'B', 'Schwefeloxidierer', 'Sulfid', 'mikroaerophil', 'mesophil', 'Sediment', 'Filament', 3, 'An ihr entdeckte Winogradsky 1887, dass Leben von anorganischen Stoffen leben kann.'],
  ['Thiomargarita namibiensis', 'Schwefelperle Namibias', 'B', 'Schwefeloxidierer', 'Sulfid', 'mikroaerophil', 'mesophil', 'Sediment', 'Kokke', 5, 'Bis 0,75 mm groß – mit bloßem Auge sichtbar, wie eine Perlenkette.'],
  ['Candidatus Thiomargarita magnifica', 'Prächtige Schwefelperle', 'B', 'Schwefeloxidierer', 'Sulfid', 'mikroaerophil', 'mesophil', 'Sediment', 'Filament', 5, 'Das größte bekannte Bakterium: bis 2 cm lang, 2022 in Mangroven Guadeloupes beschrieben.'],
  ['Thioploca araucae', 'Chilenische Thioploca', 'B', 'Schwefeloxidierer', 'Sulfid', 'anaerob', 'mesophil', 'Sediment', 'Filament', 4, 'Bildet vor Chile kilometerweite Matten und atmet mit Nitrat statt Sauerstoff.'],
  ['Thiobacillus denitrificans', 'Denitrifizierender Thiobacillus', 'B', 'Schwefeloxidierer', 'Schwefel', 'fakultativ', 'mesophil', 'Sediment', 'Stäbchen', 3, 'Oxidiert Schwefel und reduziert gleichzeitig Nitrat – verbindet zwei Kreisläufe.'],
  ['Acidithiobacillus thiooxidans', 'Schwefelsäure-Bakterium', 'B', 'Schwefeloxidierer', 'Schwefel', 'aerob', 'mesophil', 'Saures Grubenwasser', 'Stäbchen', 3, 'Produziert Schwefelsäure und frisst Beton in Abwasserkanälen.'],
  ['Thiovulum majus', 'Schwefel-Sprinter', 'B', 'Schwefeloxidierer', 'Sulfid', 'mikroaerophil', 'mesophil', 'Meer', 'Kokke', 4, 'Eines der schnellsten Bakterien: bis 600 µm pro Sekunde.'],
  ['Candidatus Endoriftia persephone', 'Röhrenwurm-Symbiont', 'B', 'Schwefeloxidierer', 'Sulfid', 'aerob', 'mesophil', 'Tiefsee-Schlot', 'Stäbchen', 5, 'Ernährt den Riesenröhrenwurm Riftia, der weder Mund noch Darm hat.'],
  ['Sulfolobus acidocaldarius', 'Saures Heißschwefel-Archaeon', 'A', 'Schwefeloxidierer', 'Schwefel', 'aerob', 'thermophil', 'Heiße Quelle', 'Kokke', 3, 'Von Thomas Brock in Yellowstone entdeckt – lebt bei 80 °C und pH 2.'],
  ['Candidatus Electrothrix communis', 'Kabelbakterium', 'B', 'Kabelbakterien', 'Sulfid', 'mikroaerophil', 'mesophil', 'Sediment', 'Filament', 5, 'Zentimeterlange lebende Stromkabel: leitet Elektronen von Sulfid im Schlamm zum Sauerstoff oben.'],

  /* ===================== EISEN & METALLE ===================== */
  ['Acidithiobacillus ferrooxidans', 'Eisen-Bergbaubakterium', 'B', 'Eisenoxidierer', 'Eisen(II)', 'aerob', 'mesophil', 'Saures Grubenwasser', 'Stäbchen', 2, 'Wird beim Biomining eingesetzt, um Kupfer aus Erz zu lösen.'],
  ['Leptospirillum ferrooxidans', 'Eisenspirille', 'B', 'Eisenoxidierer', 'Eisen(II)', 'aerob', 'mesophil', 'Saures Grubenwasser', 'Spirille', 3, 'Dominiert die extrem sauren Biofilme der Iron Mountain Mine.'],
  ['Gallionella ferruginea', 'Eisenstiel-Bakterium', 'B', 'Eisenoxidierer', 'Eisen(II)', 'mikroaerophil', 'mesophil', 'Süßwasser', 'Stäbchen', 3, 'Scheidet gedrehte Bänder aus Rost aus – verstopft Brunnen.'],
  ['Leptothrix ochracea', 'Ocker-Scheidenbakterium', 'B', 'Eisenoxidierer', 'Eisen(II)', 'aerob', 'mesophil', 'Süßwasser', 'Filament', 3, 'Erzeugt den orangen Ockerschlamm in Bächen und Gräben.'],
  ['Mariprofundus ferrooxydans', 'Tiefsee-Eisenoxidierer', 'B', 'Eisenoxidierer', 'Eisen(II)', 'mikroaerophil', 'mesophil', 'Tiefsee-Schlot', 'Stäbchen', 4, 'Baut Eisenmatten an untermeerischen Vulkanen wie dem Lōʻihi.'],
  ['Sideroxydans lithotrophicus', 'Felsen-Eisenoxidierer', 'B', 'Eisenoxidierer', 'Eisen(II)', 'mikroaerophil', 'mesophil', 'Süßwasser', 'Stäbchen', 4, 'Lebt an der Grenze zwischen sauerstoffarmem Grundwasser und Luft.'],
  ['Ferroplasma acidiphilum', 'Säure-Eisen-Archaeon', 'A', 'Eisenoxidierer', 'Eisen(II)', 'aerob', 'mesophil', 'Saures Grubenwasser', 'Kokke', 4, 'Hat keine Zellwand und überlebt bei pH 0.'],
  ['Geobacter sulfurreducens', 'Strom-Bakterium', 'B', 'Eisenreduzierer', 'Eisen(III)', 'anaerob', 'mesophil', 'Sediment', 'Stäbchen', 3, 'Leitet Strom über Nanodrähte – Grundlage mikrobieller Brennstoffzellen.'],
  ['Geobacter metallireducens', 'Metallreduzierer', 'B', 'Eisenreduzierer', 'Eisen(III)', 'anaerob', 'mesophil', 'Sediment', 'Stäbchen', 3, 'Erstes bekanntes Bakterium, das Eisenoxid atmet – aus dem Potomac River.'],
  ['Shewanella oneidensis', 'Oneida-Shewanella', 'B', 'Eisenreduzierer', 'Eisen(III)', 'fakultativ', 'mesophil', 'Sediment', 'Stäbchen', 3, 'Kann Uran und Chrom reduzieren und unschädlicher machen.'],
  ['Rhodoferax ferrireducens', 'Kälte-Eisenreduzierer', 'B', 'Eisenreduzierer', 'Eisen(III)', 'anaerob', 'psychrophil', 'Sediment', 'Stäbchen', 4, 'Wandelt Zucker direkt in Strom um – auch bei Kälte.'],
  ['Magnetospirillum magneticum', 'Kompass-Bakterium', 'B', 'Magnetotaktische', 'Eisen(III)', 'mikroaerophil', 'mesophil', 'Süßwasser', 'Spirille', 3, 'Baut eine Kette aus Magnetit-Kristallen und richtet sich am Erdmagnetfeld aus.'],
  ['Magnetococcus marinus', 'Meeres-Magnetkokke', 'B', 'Magnetotaktische', 'Eisen(III)', 'mikroaerophil', 'mesophil', 'Meer', 'Kokke', 4, 'Schwimmt mit zwei Geißelbündeln entlang der Magnetfeldlinien.'],
  ['Candidatus Magnetobacterium bavaricum', 'Bayerisches Magnetbakterium', 'B', 'Magnetotaktische', 'Eisen(III)', 'mikroaerophil', 'mesophil', 'Sediment', 'Stäbchen', 5, 'Aus dem Chiemsee: bis zu 1000 Magnetkristalle in einer Zelle.'],
  ['Leptothrix discophora', 'Mangan-Scheidenbakterium', 'B', 'Manganoxidierer', 'Mangan', 'aerob', 'mesophil', 'Süßwasser', 'Filament', 4, 'Überzieht Steine in Bächen mit schwarzem Manganoxid.'],
  ['Candidatus Manganitrophus noduliformans', 'Mangan-Fresser', 'B', 'Manganoxidierer', 'Mangan', 'aerob', 'mesophil', 'Süßwasser', 'Stäbchen', 5, '2020 zufällig in einem vergessenen Glas am Caltech entdeckt – lebt von Mangan.'],

  /* ===================== METHAN & GASE ===================== */
  ['Methanobrevibacter smithii', 'Darm-Methanbildner', 'A', 'Methanogene', 'CO₂ + H₂', 'anaerob', 'mesophil', 'Darm', 'Kokke', 2, 'Das häufigste Archaeon im menschlichen Darm.'],
  ['Methanosarcina barkeri', 'Barkers Methansarcina', 'A', 'Methanogene', 'Acetat', 'anaerob', 'mesophil', 'Sediment', 'Kokke', 3, 'Bildet Zellpakete und nutzt mehr Substrate als fast jeder andere Methanbildner.'],
  ['Methanothrix concilii', 'Faden-Methanbildner', 'A', 'Methanogene', 'Acetat', 'anaerob', 'mesophil', 'Kläranlage', 'Filament', 3, 'Erzeugt in Biogasanlagen einen Großteil des Methans aus Acetat.'],
  ['Methanothermobacter thermautotrophicus', 'Hitze-Methanbildner', 'A', 'Methanogene', 'CO₂ + H₂', 'anaerob', 'thermophil', 'Kläranlage', 'Stäbchen', 3, 'Wird zur Speicherung von Ökostrom als Methan getestet (Power-to-Gas).'],
  ['Methanocaldococcus jannaschii', 'Jannaschs Methankokke', 'A', 'Methanogene', 'CO₂ + H₂', 'anaerob', 'hyperthermophil', 'Tiefsee-Schlot', 'Kokke', 4, '1996 das erste vollständig sequenzierte Archaeen-Genom.'],
  ['Methanopyrus kandleri', 'Feuer-Methanbildner', 'A', 'Methanogene', 'CO₂ + H₂', 'anaerob', 'hyperthermophil', 'Tiefsee-Schlot', 'Stäbchen', 5, 'Ein Stamm wächst noch bei 122 °C – Hitzerekord für Leben.'],
  ['Methanococcoides burtonii', 'Antarktischer Methanbildner', 'A', 'Methanogene', 'Methanol', 'anaerob', 'psychrophil', 'Salzsee', 'Kokke', 4, 'Aus dem eiskalten Ace Lake in der Antarktis.'],
  ['Methylococcus capsulatus', 'Methanfresser von Bath', 'B', 'Methanotrophe', 'Methan', 'aerob', 'thermophil', 'Heiße Quelle', 'Kokke', 3, 'Aus den römischen Bädern von Bath – wird zu Tierfutter-Protein verarbeitet.'],
  ['Methylosinus trichosporium', 'Boden-Methanfresser', 'B', 'Methanotrophe', 'Methan', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 3, 'Sein Enzym Methan-Monooxygenase baut auch Schadstoffe ab.'],
  ['Candidatus Methylomirabilis oxyfera', 'Sauerstoff-Zauberer', 'B', 'Methanotrophe', 'Methan', 'anaerob', 'mesophil', 'Sediment', 'Stäbchen', 5, 'Stellt ohne Licht eigenen Sauerstoff aus Nitrit her, um Methan zu verbrennen.'],
  ['Candidatus Methanoperedens nitroreducens', 'Methan-Atmer', 'A', 'Methanotrophe', 'Methan', 'anaerob', 'mesophil', 'Sediment', 'Kokke', 5, 'Baut Methan ohne Sauerstoff ab – mit Nitrat als Partner.'],
  ['Methylorubrum extorquens', 'Rosa Blattbakterium', 'B', 'Methylotrophe', 'Methanol', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 3, 'Lebt auf Blättern vom Methanol, das Pflanzen ausatmen.'],
  ['Cupriavidus necator', 'Knallgasbakterium', 'B', 'Wasserstoffoxidierer', 'Wasserstoff', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 3, 'Speichert Bioplastik (PHB) und lebt von Wasserstoff und CO₂.'],
  ['Aquifex aeolicus', 'Wasserstoff-Urbakterium', 'B', 'Wasserstoffoxidierer', 'Wasserstoff', 'mikroaerophil', 'hyperthermophil', 'Heiße Quelle', 'Stäbchen', 4, 'Eines der hitzeliebendsten Bakterien – bis 95 °C.'],
  ['Hydrogenobacter thermophilus', 'Heißer Wasserstoffoxidierer', 'B', 'Wasserstoffoxidierer', 'Wasserstoff', 'aerob', 'thermophil', 'Heiße Quelle', 'Stäbchen', 4, 'Aus japanischen heißen Quellen, fixiert CO₂ über einen umgekehrten Citratzyklus.'],
  ['Pyrolobus fumarii', 'Feuerlappen der Schlote', 'A', 'Wasserstoffoxidierer', 'Wasserstoff', 'anaerob', 'hyperthermophil', 'Tiefsee-Schlot', 'Kokke', 5, 'Wächst bis 113 °C und erstarrt erst unter 90 °C zur Ruhe.'],

  /* ===================== LICHT ===================== */
  ['Prochlorococcus marinus', 'Ozean-Grünling', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Meer', 'Kokke', 2, 'Der häufigste Photosynthese-Organismus der Erde – erst 1988 entdeckt.'],
  ['Synechococcus elongatus', 'Uhren-Cyanobakterium', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Süßwasser', 'Stäbchen', 2, 'Besitzt eine innere Uhr aus nur drei Proteinen.'],
  ['Synechocystis sp. PCC 6803', 'Modell-Cyanobakterium', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Süßwasser', 'Kokke', 2, '1996 das erste sequenzierte photosynthetische Lebewesen.'],
  ['Nostoc commune', 'Sternschnuppen-Gallerte', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Boden', 'Filament', 2, 'Nach Regen tauchen seine Gallertklumpen plötzlich auf – früher hielt man sie für Sternschnuppenreste.'],
  ['Arthrospira platensis', 'Spirulina', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Salzsee', 'Spirille', 2, 'Wächst in alkalischen Seen und wird als Nahrungsergänzung verkauft.'],
  ['Microcystis aeruginosa', 'Blaualgenblüte', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Süßwasser', 'Kokke', 2, 'Verursacht grüne Teppiche auf Seen im Sommer.'],
  ['Gloeobacter violaceus', 'Urtümliches Cyanobakterium', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Felsen', 'Stäbchen', 4, 'Betreibt Photosynthese ohne Thylakoide – direkt an der Zellmembran.'],
  ['Crocosphaera watsonii', 'Nacht-Stickstofffixierer', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Meer', 'Kokke', 4, 'Photosynthese am Tag, Stickstofffixierung in der Nacht.'],
  ['Chroococcidiopsis thermalis', 'Wüsten-Cyanobakterium', 'B', 'Cyanobakterien', 'Licht', 'aerob', 'mesophil', 'Wüste', 'Kokke', 4, 'Überlebt jahrelange Trockenheit unter Steinen der Wüste – Kandidat für Mars-Experimente.'],
  ['Candidatus Atelocyanobacterium thalassa', 'Werdendes Nitroplast', 'B', 'Cyanobakterien', 'Luftstickstoff', 'aerob', 'mesophil', 'Meer', 'Kokke', 5, '2024: Wird gerade zum Organell einer Alge – das erste bekannte stickstofffixierende Organell.'],
  ['Rhodobacter sphaeroides', 'Purpur-Kugelbakterium', 'B', 'Purpurbakterien', 'Licht', 'fakultativ', 'mesophil', 'Süßwasser', 'Kokke', 2, 'Kann Photosynthese, Atmung und Gärung – ein Stoffwechsel-Allrounder.'],
  ['Rhodospirillum rubrum', 'Rote Spirille', 'B', 'Purpurbakterien', 'Licht', 'fakultativ', 'mesophil', 'Süßwasser', 'Spirille', 2, 'Rot gefärbt durch Bakteriochlorophyll und Carotinoide.'],
  ['Chromatium okenii', 'Okens Purpurschwefelbakterium', 'B', 'Purpurbakterien', 'Licht', 'anaerob', 'mesophil', 'Süßwasser', 'Stäbchen', 3, 'Erzeugt rosa Schichten in Seen und mischt beim Schwimmen das Wasser.'],
  ['Chlorobaculum tepidum', 'Warmes Grünes Schwefelbakterium', 'B', 'Grüne Schwefelbakterien', 'Licht', 'anaerob', 'thermophil', 'Heiße Quelle', 'Stäbchen', 3, 'Sammelt Licht mit riesigen Antennen, den Chlorosomen.'],
  ['Chlorobium limicola', 'Schlamm-Grünschwefelbakterium', 'B', 'Grüne Schwefelbakterien', 'Licht', 'anaerob', 'mesophil', 'Sediment', 'Stäbchen', 3, 'Ein Verwandter lebt im Schwarzen Meer von fast keinem Licht.'],
  ['Chloroflexus aurantiacus', 'Orangefarbener Grünfaden', 'B', 'Grüne Nichtschwefelbakterien', 'Licht', 'fakultativ', 'thermophil', 'Heiße Quelle', 'Filament', 3, 'Bildet orange Matten in heißen Quellen.'],
  ['Heliobacterium chlorum', 'Sonnenbakterium', 'B', 'Heliobakterien', 'Licht', 'anaerob', 'mesophil', 'Boden', 'Stäbchen', 4, 'Hat das einfachste bekannte Photosystem.'],

  /* ===================== ABBAU ===================== */
  ['Bacillus subtilis', 'Heubazillus', 'B', 'Zersetzer', 'Humus', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 1, 'Bildet extrem widerstandsfähige Sporen – fermentiert in Japan Sojabohnen zu Natto.'],
  ['Priestia megaterium', 'Riesen-Bazillus', 'B', 'Zersetzer', 'Humus', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 2, 'Eines der größten Bakterien, früher Bacillus megaterium genannt.'],
  ['Cellulomonas fimi', 'Cellulose-Spalter', 'B', 'Zersetzer', 'Cellulose', 'fakultativ', 'mesophil', 'Boden', 'Stäbchen', 3, 'Zerlegt Pflanzenfasern mit einem ganzen Arsenal an Enzymen.'],
  ['Cytophaga hutchinsonii', 'Gleitender Cellulose-Fresser', 'B', 'Zersetzer', 'Cellulose', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 3, 'Gleitet ohne Geißeln über Cellulosefasern.'],
  ['Acetivibrio thermocellus', 'Hitze-Cellulose-Gärer', 'B', 'Zersetzer', 'Cellulose', 'anaerob', 'thermophil', 'Kompost', 'Stäbchen', 3, 'Besitzt das Cellulosom, eine Enzym-Maschine zum Holzabbau.'],
  ['Serratia marcescens', 'Hostienblut-Bakterium', 'B', 'Zersetzer', 'Chitin', 'fakultativ', 'mesophil', 'Boden', 'Stäbchen', 2, 'Sein rotes Pigment ließ im Mittelalter Hostien „bluten“.'],
  ['Chitinophaga pinensis', 'Chitin-Liebhaber', 'B', 'Zersetzer', 'Chitin', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 4, 'Baut Insektenpanzer und Pilzwände ab.'],
  ['Arthrobacter globiformis', 'Formwandler', 'B', 'Zersetzer', 'Humus', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 2, 'Wechselt zwischen Stäbchen- und Kugelform.'],
  ['Pseudomonas fluorescens', 'Leuchtende Pseudomonade', 'B', 'Zersetzer', 'Humus', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 2, 'Leuchtet unter UV-Licht und schützt Wurzeln vor Pilzen.'],
  ['Pseudomonas putida', 'Lösungsmittel-Fresser', 'B', 'Schadstoffabbauer', 'Kohlenwasserstoffe', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 2, 'Baut Toluol und andere Lösungsmittel ab.'],
  ['Alcanivorax borkumensis', 'Öl-Fresser von Borkum', 'B', 'Schadstoffabbauer', 'Kohlenwasserstoffe', 'aerob', 'mesophil', 'Meer', 'Stäbchen', 3, 'Vermehrt sich nach Ölkatastrophen explosionsartig.'],
  ['Ideonella sakaiensis', 'PET-Fresser', 'B', 'Schadstoffabbauer', 'Plastik (PET)', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 4, '2016 vor einer Recyclinganlage in Japan entdeckt: frisst PET-Plastik.'],
  ['Dehalococcoides mccartyi', 'Chlor-Entgifter', 'B', 'Schadstoffabbauer', 'Chlorverbindungen', 'anaerob', 'mesophil', 'Sediment', 'Kokke', 4, 'Atmet giftige Chlorlösungsmittel und macht sie harmlos.'],
  ['Streptomyces griseus', 'Streptomycin-Bildner', 'B', 'Antibiotikabildner', 'Humus', 'aerob', 'mesophil', 'Boden', 'Filament', 2, 'Lieferte 1943 Streptomycin, das erste Mittel gegen Tuberkulose.'],
  ['Streptomyces coelicolor', 'Blauer Streptomyces', 'B', 'Antibiotikabildner', 'Humus', 'aerob', 'mesophil', 'Boden', 'Filament', 2, 'Bildet blaue Antibiotika-Tröpfchen; Streptomyceten verleihen Erde ihren Geruch (Geosmin).'],
  ['Streptomyces avermitilis', 'Avermectin-Bildner', 'B', 'Antibiotikabildner', 'Humus', 'aerob', 'mesophil', 'Boden', 'Filament', 3, 'Aus einer Bodenprobe neben einem japanischen Golfplatz – Nobelpreis 2015.'],
  ['Streptomyces venezuelae', 'Chloramphenicol-Bildner', 'B', 'Antibiotikabildner', 'Humus', 'aerob', 'mesophil', 'Boden', 'Filament', 3, 'Aus venezolanischem Boden; bildet auch in Flüssigkultur Sporen.'],
  ['Myxococcus xanthus', 'Wolfsrudel-Bakterium', 'B', 'Räuber', 'Beutebakterien', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 3, 'Jagt im Schwarm und baut bei Hunger gemeinsam Fruchtkörper.'],
  ['Bdellovibrio bacteriovorus', 'Bakterienfresser', 'B', 'Räuber', 'Beutebakterien', 'aerob', 'mesophil', 'Boden', 'Spirille', 4, 'Dringt in andere Bakterien ein und frisst sie von innen.'],
  ['Pelagibacter ubique', 'Allgegenwärtiger Meeresbewohner', 'B', 'Heterotrophe', 'Gelöste Organik', 'aerob', 'mesophil', 'Meer', 'Stäbchen', 2, 'Vielleicht der häufigste Organismus der Welt (SAR11-Gruppe).'],
  ['Caulobacter crescentus', 'Halbmond-Bakterium', 'B', 'Heterotrophe', 'Gelöste Organik', 'aerob', 'mesophil', 'Süßwasser', 'Stäbchen', 3, 'Teilt sich immer in eine sesshafte und eine schwimmende Tochterzelle.'],
  ['Gemmata obscuriglobus', 'Knospendes Planctomycet', 'B', 'Heterotrophe', 'Gelöste Organik', 'aerob', 'mesophil', 'Süßwasser', 'Kokke', 4, 'Besitzt ein Netzwerk innerer Membranen und vermehrt sich durch Knospung.'],
  ['Zoogloea ramigera', 'Flocken-Bakterium', 'B', 'Heterotrophe', 'Gelöste Organik', 'aerob', 'mesophil', 'Kläranlage', 'Stäbchen', 3, 'Bildet die Schlammflocken, die Abwasser klären.'],
  ['Sphaerotilus natans', 'Abwasserpilz', 'B', 'Heterotrophe', 'Gelöste Organik', 'aerob', 'mesophil', 'Kläranlage', 'Filament', 3, 'Trotz des Namens „Abwasserpilz“ ein Bakterium – bildet Zotten in Bächen.'],
  ['Candidatus Accumulibacter phosphatis', 'Phosphat-Sammler', 'B', 'Phosphatspeicherer', 'Phosphat', 'fakultativ', 'mesophil', 'Kläranlage', 'Kokke', 4, 'Holt Phosphat aus dem Abwasser und speichert es als Polyphosphat.'],

  /* ===================== GÄRUNG & LEBENSMITTEL ===================== */
  ['Lactobacillus delbrueckii subsp. bulgaricus', 'Joghurt-Bakterium', 'B', 'Milchsäurebakterien', 'Laktose', 'aerotolerant', 'thermophil', 'Lebensmittel', 'Stäbchen', 1, 'Macht mit Streptococcus thermophilus aus Milch Joghurt.'],
  ['Streptococcus thermophilus', 'Wärmeliebende Joghurtkokke', 'B', 'Milchsäurebakterien', 'Laktose', 'aerotolerant', 'thermophil', 'Lebensmittel', 'Kokke', 1, 'An ihm wurde CRISPR als bakterielles Immunsystem erkannt.'],
  ['Lactococcus lactis', 'Käse-Kokke', 'B', 'Milchsäurebakterien', 'Laktose', 'aerotolerant', 'mesophil', 'Lebensmittel', 'Kokke', 1, 'Säuert Milch für Käse und bildet das Konservierungsmittel Nisin.'],
  ['Lactiplantibacillus plantarum', 'Sauerkraut-Bakterium', 'B', 'Milchsäurebakterien', 'Zucker', 'aerotolerant', 'mesophil', 'Lebensmittel', 'Stäbchen', 1, 'Macht Kohl zu Sauerkraut und Gurken sauer.'],
  ['Leuconostoc mesenteroides', 'Froschlaich-Bakterium', 'B', 'Milchsäurebakterien', 'Zucker', 'aerotolerant', 'mesophil', 'Lebensmittel', 'Kokke', 2, 'Bildet Dextran-Schleim – verstopfte früher Zuckerfabriken.'],
  ['Lacticaseibacillus rhamnosus', 'Probiotikum-Stäbchen', 'B', 'Milchsäurebakterien', 'Zucker', 'aerotolerant', 'mesophil', 'Darm', 'Stäbchen', 2, 'Der Stamm GG ist eines der meistuntersuchten Probiotika.'],
  ['Oenococcus oeni', 'Wein-Kokke', 'B', 'Milchsäurebakterien', 'Zucker', 'aerotolerant', 'mesophil', 'Lebensmittel', 'Kokke', 3, 'Macht Rotwein weicher, indem sie Äpfelsäure in Milchsäure umwandelt.'],
  ['Tetragenococcus halophilus', 'Sojasoßen-Kokke', 'B', 'Milchsäurebakterien', 'Salzlake', 'aerotolerant', 'mesophil', 'Lebensmittel', 'Kokke', 3, 'Gärt in salziger Sojamaische und Fischsoße.'],
  ['Propionibacterium freudenreichii', 'Emmentaler-Bakterium', 'B', 'Gärer', 'Laktat', 'aerotolerant', 'mesophil', 'Lebensmittel', 'Stäbchen', 2, 'Sein CO₂ macht die Löcher im Emmentaler.'],
  ['Acetobacter aceti', 'Essigbakterium', 'B', 'Essigsäurebakterien', 'Ethanol', 'aerob', 'mesophil', 'Lebensmittel', 'Stäbchen', 2, 'Verwandelt Wein in Essig und bildet die „Essigmutter“.'],
  ['Gluconobacter oxydans', 'Unvollständiger Oxidierer', 'B', 'Essigsäurebakterien', 'Zucker', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 3, 'Wird zur industriellen Herstellung von Vitamin C eingesetzt.'],
  ['Komagataeibacter xylinus', 'Kombucha-Bakterium', 'B', 'Essigsäurebakterien', 'Zucker', 'aerob', 'mesophil', 'Lebensmittel', 'Stäbchen', 2, 'Spinnt reine Bakteriencellulose – den Kombucha-„Pilz“.'],
  ['Zymomonas mobilis', 'Pulque-Bakterium', 'B', 'Gärer', 'Zucker', 'aerotolerant', 'mesophil', 'Pflanze', 'Stäbchen', 3, 'Gärt Agavensaft zu Pulque, schneller als Hefe.'],
  ['Brevibacterium linens', 'Käserinden-Bakterium', 'B', 'Gärer', 'Aminosäuren', 'aerob', 'mesophil', 'Lebensmittel', 'Stäbchen', 2, 'Gibt Limburger seinen Geruch – und Füßen ebenso.'],
  ['Clostridium acetobutylicum', 'Weizmann-Organismus', 'B', 'Gärer', 'Stärke', 'anaerob', 'mesophil', 'Boden', 'Stäbchen', 3, 'Lieferte im Ersten Weltkrieg Aceton – entdeckt von Chaim Weizmann.'],
  ['Thermotoga maritima', 'Hitze-Toga', 'B', 'Gärer', 'Zucker', 'anaerob', 'hyperthermophil', 'Tiefsee-Schlot', 'Stäbchen', 4, 'Trägt eine lose Hülle wie eine Toga und lebt bei 80 °C.'],
  ['Pyrococcus furiosus', 'Rasender Feuerball', 'A', 'Gärer', 'Aminosäuren', 'anaerob', 'hyperthermophil', 'Tiefsee-Schlot', 'Kokke', 4, 'Verdoppelt sich bei 100 °C alle 37 Minuten.'],

  /* ===================== SYMBIOSE / FLORA ===================== */
  ['Escherichia coli', 'Darmbakterium', 'B', 'Darmflora', 'Zucker', 'fakultativ', 'mesophil', 'Darm', 'Stäbchen', 1, 'Das meistuntersuchte Lebewesen der Welt – 1885 von Theodor Escherich beschrieben.'],
  ['Bacteroides thetaiotaomicron', 'Ballaststoff-Spezialist', 'B', 'Darmflora', 'Ballaststoffe', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 2, 'Besitzt Hunderte Gene für den Abbau von Pflanzenzuckern.'],
  ['Faecalibacterium duncaniae', 'Butyrat-Bildner', 'B', 'Darmflora', 'Ballaststoffe', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 3, 'Füttert Darmzellen mit Butyrat – früher F. prausnitzii genannt.'],
  ['Akkermansia muciniphila', 'Schleim-Liebhaber', 'B', 'Darmflora', 'Mucin', 'anaerob', 'mesophil', 'Darm', 'Kokke', 3, 'Lebt vom Schleim der Darmwand und wird mit gesundem Stoffwechsel verbunden.'],
  ['Segatella copri', 'Ballaststoff-Prevotella', 'B', 'Darmflora', 'Ballaststoffe', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 3, 'Häufig bei Menschen mit pflanzenreicher Kost.'],
  ['Roseburia intestinalis', 'Darm-Roseburia', 'B', 'Darmflora', 'Ballaststoffe', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 3, 'Begeißelter Butyratproduzent im Dickdarm.'],
  ['Christensenella minuta', 'Erbliche Darmbakterie', 'B', 'Darmflora', 'Zucker', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 4, 'Das am stärksten erbliche Darmbakterium – häufiger bei schlanken Menschen.'],
  ['Oxalobacter formigenes', 'Oxalat-Fresser', 'B', 'Darmflora', 'Oxalat', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 4, 'Baut Oxalat ab und kann so Nierensteinen vorbeugen.'],
  ['Bifidobacterium longum', 'Muttermilch-Bifidobakterium', 'B', 'Darmflora', 'Ballaststoffe', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 2, 'Y-förmig; verdaut Zucker aus Muttermilch.'],
  ['Enterococcus faecalis', 'Darm-Enterokokke', 'B', 'Darmflora', 'Zucker', 'fakultativ', 'mesophil', 'Darm', 'Kokke', 2, 'Extrem zäh: überlebt Hitze, Salz und viele Antibiotika.'],
  ['Epulopiscium fishelsoni', 'Doktorfisch-Riese', 'B', 'Darmflora', 'Ballaststoffe', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 5, 'Lebt im Darm von Doktorfischen und wird bis 0,6 mm lang.'],
  ['Staphylococcus epidermidis', 'Hautkokke', 'B', 'Hautflora', 'Talg', 'fakultativ', 'mesophil', 'Haut', 'Kokke', 1, 'Auf jedem Menschen – schützt die Haut vor Eindringlingen.'],
  ['Cutibacterium acnes', 'Pickel-Bakterium', 'B', 'Hautflora', 'Talg', 'aerotolerant', 'mesophil', 'Haut', 'Stäbchen', 1, 'Lebt in Haarfollikeln und frisst Hautfett.'],
  ['Micrococcus luteus', 'Gelbe Mikrokokke', 'B', 'Hautflora', 'Talg', 'aerob', 'mesophil', 'Haut', 'Kokke', 1, 'An ihr entdeckte Alexander Fleming 1922 das Lysozym.'],
  ['Corynebacterium glutamicum', 'Glutamat-Bakterium', 'B', 'Heterotrophe', 'Zucker', 'aerob', 'mesophil', 'Boden', 'Stäbchen', 2, 'Produziert jährlich Millionen Tonnen Glutamat und Lysin.'],
  ['Streptococcus mutans', 'Karies-Kokke', 'B', 'Mundflora', 'Zucker', 'fakultativ', 'mesophil', 'Mund', 'Kokke', 1, 'Macht aus Zucker Säure – der Hauptverursacher von Karies.'],
  ['Streptococcus salivarius', 'Speichel-Kokke', 'B', 'Mundflora', 'Zucker', 'fakultativ', 'mesophil', 'Mund', 'Kokke', 2, 'Einer der ersten Besiedler im Mund eines Neugeborenen.'],
  ['Helicobacter pylori', 'Magenkeim', 'B', 'Humanpathogene', 'Harnstoff', 'mikroaerophil', 'mesophil', 'Magen', 'Spirille', 2, 'Barry Marshall trank eine Kultur, um zu beweisen, dass er Magengeschwüre auslöst – Nobelpreis 2005.'],
  ['Wolbachia pipientis', 'Insekten-Manipulator', 'B', 'Endosymbionten', 'Wirtsgewebe', 'aerob', 'mesophil', 'Gliederfüßer', 'Kokke', 3, 'Steckt in rund der Hälfte aller Insektenarten und steuert deren Fortpflanzung.'],
  ['Buchnera aphidicola', 'Blattlaus-Symbiont', 'B', 'Endosymbionten', 'Wirtsgewebe', 'aerob', 'mesophil', 'Gliederfüßer', 'Kokke', 4, 'Seit 200 Mio. Jahren in Blattläusen – liefert ihnen Aminosäuren.'],
  ['Candidatus Carsonella ruddii', 'Mini-Genom-Symbiont', 'B', 'Endosymbionten', 'Wirtsgewebe', 'aerob', 'mesophil', 'Gliederfüßer', 'Stäbchen', 5, 'Eines der kleinsten Genome überhaupt: nur rund 160.000 Basen.'],
  ['Aliivibrio fischeri', 'Tintenfisch-Leuchtbakterium', 'B', 'Leuchtsymbionten', 'Aminosäuren', 'fakultativ', 'mesophil', 'Meer', 'Spirille', 3, 'Leuchtet im Hawaii-Zwergtintenfisch – hier wurde Quorum Sensing entdeckt.'],
  ['Photobacterium phosphoreum', 'Kalter Leuchtfisch-Keim', 'B', 'Leuchtsymbionten', 'Aminosäuren', 'fakultativ', 'psychrophil', 'Meer', 'Stäbchen', 3, 'Lässt Fisch im Dunkeln leuchten.'],

  /* ===================== BEKANNTE HUMAN- & PFLANZENPATHOGENE ===================== */
  ['Staphylococcus aureus', 'Goldener Traubenkokke', 'B', 'Humanpathogene', 'Aminosäuren', 'fakultativ', 'mesophil', 'Haut', 'Kokke', 1, 'Lebt bei vielen Menschen harmlos in der Nase; Fleming entdeckte Penicillin auf einer seiner Platten.'],
  ['Pseudomonas aeruginosa', 'Blaugrüner Eiter-Keim', 'B', 'Humanpathogene', 'Gelöste Organik', 'fakultativ', 'mesophil', 'Süßwasser', 'Stäbchen', 1, 'Färbt Nährböden blaugrün und riecht nach Lindenblüten.'],
  ['Mycobacterium tuberculosis', 'Tuberkulose-Bakterium', 'B', 'Humanpathogene', 'Wirtsgewebe', 'aerob', 'mesophil', 'Atemwege', 'Stäbchen', 2, '1882 von Robert Koch entdeckt – der 24. März ist Welttuberkulosetag.'],
  ['Mycobacterium leprae', 'Lepra-Bakterium', 'B', 'Humanpathogene', 'Wirtsgewebe', 'aerob', 'mesophil', 'Haut', 'Stäbchen', 4, 'Lässt sich bis heute nicht auf Nährböden züchten – wächst nur in Gürteltieren.'],
  ['Streptococcus pneumoniae', 'Pneumokokke', 'B', 'Humanpathogene', 'Zucker', 'aerotolerant', 'mesophil', 'Atemwege', 'Kokke', 2, 'Griffiths Versuch von 1928 zeigte an ihr, dass Erbgut übertragbar ist.'],
  ['Salmonella enterica', 'Salmonelle', 'B', 'Humanpathogene', 'Zucker', 'fakultativ', 'mesophil', 'Darm', 'Stäbchen', 1, 'Über 2500 Serotypen – benannt nach Daniel Salmon.'],
  ['Vibrio cholerae', 'Cholera-Vibrio', 'B', 'Humanpathogene', 'Gelöste Organik', 'fakultativ', 'mesophil', 'Süßwasser', 'Spirille', 2, 'John Snow verfolgte 1854 einen Ausbruch zu einer Londoner Wasserpumpe.'],
  ['Listeria monocytogenes', 'Kühlschrank-Keim', 'B', 'Humanpathogene', 'Zucker', 'fakultativ', 'psychrophil', 'Lebensmittel', 'Stäbchen', 2, 'Vermehrt sich sogar im Kühlschrank.'],
  ['Clostridioides difficile', 'Schwieriges Clostridium', 'B', 'Humanpathogene', 'Zucker', 'anaerob', 'mesophil', 'Darm', 'Stäbchen', 2, 'Der Name kommt davon, dass er so schwer zu züchten war.'],
  ['Legionella pneumophila', 'Legionellen-Keim', 'B', 'Humanpathogene', 'Aminosäuren', 'aerob', 'mesophil', 'Süßwasser', 'Stäbchen', 2, 'Versteckt sich in Amöben in Warmwasserleitungen – benannt nach einem Veteranentreffen 1976.'],
  ['Klebsiella pneumoniae', 'Klebsiella', 'B', 'Humanpathogene', 'Zucker', 'fakultativ', 'mesophil', 'Darm', 'Stäbchen', 2, 'Hat eine dicke Schleimkapsel und kann auch Stickstoff fixieren.'],
  ['Acinetobacter baumannii', 'Klinik-Überlebender', 'B', 'Humanpathogene', 'Gelöste Organik', 'aerob', 'mesophil', 'Haushalt', 'Kokke', 3, 'Überlebt wochenlang auf trockenen Oberflächen.'],
  ['Borrelia burgdorferi', 'Borreliose-Spirochäte', 'B', 'Humanpathogene', 'Wirtsgewebe', 'mikroaerophil', 'mesophil', 'Gliederfüßer', 'Spirille', 3, 'Wird von Zecken übertragen; Genom auf über 20 Plasmide verteilt.'],
  ['Treponema pallidum', 'Bleiche Spirochäte', 'B', 'Humanpathogene', 'Wirtsgewebe', 'mikroaerophil', 'mesophil', 'Blut', 'Spirille', 3, 'Korkenzieherförmig – erst 2018 gelang die Dauerkultur im Labor.'],
  ['Chlamydia trachomatis', 'Chlamydie', 'B', 'Humanpathogene', 'Wirtsgewebe', 'aerob', 'mesophil', 'Blut', 'Kokke', 3, 'Lebt nur in Wirtszellen – lange hielt man sie für ein Virus.'],
  ['Agrobacterium tumefaciens', 'Wurzelhals-Gallen-Bakterium', 'B', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 2, 'Natürlicher Gentechniker: schleust eigene DNA in Pflanzen ein.'],
  ['Xanthomonas campestris', 'Kohl-Schwarzadern-Bakterium', 'B', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 2, 'Liefert Xanthan, das Verdickungsmittel E 415.'],
  ['Pseudomonas syringae', 'Eiskeim-Bakterium', 'B', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 3, 'Lässt Wasser schon bei −2 °C gefrieren – wird für Kunstschnee genutzt.'],
  ['Erwinia amylovora', 'Feuerbrand-Erreger', 'B', 'Pflanzenpathogene', 'Pflanzensaft', 'fakultativ', 'mesophil', 'Pflanze', 'Stäbchen', 3, 'Lässt Apfel- und Birnbäume wie verbrannt aussehen.'],
  ['Xylella fastidiosa', 'Olivensterben-Bakterium', 'B', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Stäbchen', 4, 'Verstopft die Leitbahnen und hat in Apulien Millionen Olivenbäume getötet.'],
  ['Spiroplasma citri', 'Zitrus-Spiroplasma', 'B', 'Pflanzenpathogene', 'Pflanzensaft', 'fakultativ', 'mesophil', 'Pflanze', 'Spirille', 4, 'Zellwandlos und spiralig, wird von Zikaden übertragen.'],

  /* ===================== EXTREMOPHILE ===================== */
  ['Thermus aquaticus', 'Taq-Bakterium', 'B', 'Thermophile', 'Gelöste Organik', 'aerob', 'thermophil', 'Heiße Quelle', 'Stäbchen', 2, 'Seine Taq-Polymerase machte die PCR möglich.'],
  ['Deinococcus radiodurans', 'Conan das Bakterium', 'B', 'Strahlenresistente', 'Gelöste Organik', 'aerob', 'mesophil', 'Lebensmittel', 'Kokke', 3, 'Übersteht das Tausendfache der für Menschen tödlichen Strahlendosis.'],
  ['Halobacterium salinarum', 'Purpur-Salz-Archaeon', 'A', 'Halophile', 'Salzlake', 'aerob', 'mesophil', 'Salzsee', 'Stäbchen', 3, 'Färbt Salinen rosa; sein Bakteriorhodopsin ist eine lichtgetriebene Pumpe.'],
  ['Haloquadratum walsbyi', 'Quadratisches Archaeon', 'A', 'Halophile', 'Salzlake', 'aerob', 'mesophil', 'Salzsee', 'Quadrat', 5, 'Flach und quadratisch wie eine Briefmarke.'],
  ['Haloferax volcanii', 'Totes-Meer-Archaeon', 'A', 'Halophile', 'Salzlake', 'aerob', 'mesophil', 'Salzsee', 'Kokke', 3, 'Aus dem Schlamm des Toten Meeres.'],
  ['Salinibacter ruber', 'Rotes Salzbakterium', 'B', 'Halophile', 'Salzlake', 'aerob', 'mesophil', 'Salzsee', 'Stäbchen', 4, 'Ein Bakterium, das lebt wie ein Salz-Archaeon.'],
  ['Picrophilus torridus', 'Säurerekordhalter', 'A', 'Acidophile', 'Gelöste Organik', 'aerob', 'thermophil', 'Heiße Quelle', 'Kokke', 5, 'Wächst am besten bei pH 0,7 – saurer als Magensäure.'],
  ['Psychrobacter arcticus', 'Permafrost-Bakterium', 'B', 'Psychrophile', 'Gelöste Organik', 'aerob', 'psychrophil', 'Eis', 'Kokke', 4, 'Aus 20.000 Jahre altem sibirischem Permafrost.'],
  ['Colwellia psychrerythraea', 'Eismeer-Colwellia', 'B', 'Psychrophile', 'Gelöste Organik', 'fakultativ', 'psychrophil', 'Meer', 'Stäbchen', 4, 'Aktiv bis −12 °C im arktischen Meereis.'],
  ['Planococcus halocryophilus', 'Frost-Rekordhalter', 'B', 'Psychrophile', 'Gelöste Organik', 'aerob', 'psychrophil', 'Eis', 'Kokke', 5, 'Vermehrt sich noch bei −15 °C.'],
  ['Nanoarchaeum equitans', 'Reitender Zwerg', 'A', 'Endosymbionten', 'Wirtsgewebe', 'anaerob', 'hyperthermophil', 'Tiefsee-Schlot', 'Kokke', 5, 'Winziger Parasit, der auf dem Archaeon Ignicoccus reitet.'],
  ['Ignicoccus hospitalis', 'Gastfreundliche Feuerkugel', 'A', 'Wasserstoffoxidierer', 'Wasserstoff', 'anaerob', 'hyperthermophil', 'Tiefsee-Schlot', 'Kokke', 5, 'Wirt von Nanoarchaeum – hat zwei Membranen.'],
  ['Candidatus Prometheoarchaeum syntrophicum', 'Prometheus-Archaeon', 'A', 'Asgard-Archaeen', 'Aminosäuren', 'anaerob', 'mesophil', 'Sediment', 'Kokke', 5, 'Ein Asgard-Archaeon mit Tentakeln – nah an unseren eukaryotischen Vorfahren. Brauchte 12 Jahre zur Kultur.'],

  /* ===================== PILZE: GÄRUNG & HEFEN ===================== */
  ['Saccharomyces cerevisiae', 'Backhefe', 'P', 'Gärhefen', 'Zucker', 'fakultativ', 'mesophil', 'Lebensmittel', 'Hefe', 1, 'Seit Jahrtausenden für Brot, Bier und Wein – erster sequenzierter Eukaryot (1996).'],
  ['Saccharomyces pastorianus', 'Lagerbierhefe', 'P', 'Gärhefen', 'Zucker', 'fakultativ', 'psychrophil', 'Lebensmittel', 'Hefe', 2, 'Kühle Gärhefe – ein Hybrid aus S. cerevisiae und einer Hefe aus Patagonien.'],
  ['Schizosaccharomyces pombe', 'Spalthefe', 'P', 'Gärhefen', 'Zucker', 'fakultativ', 'mesophil', 'Lebensmittel', 'Hefe', 2, 'Aus afrikanischem Hirsebier; teilt sich durch Spaltung statt Knospung.'],
  ['Brettanomyces bruxellensis', 'Lambic-Hefe', 'P', 'Gärhefen', 'Zucker', 'fakultativ', 'mesophil', 'Lebensmittel', 'Hefe', 3, 'Gibt belgischem Lambic den „Pferdedecken“-Geschmack.'],
  ['Kluyveromyces marxianus', 'Kefir-Hefe', 'P', 'Gärhefen', 'Laktose', 'fakultativ', 'thermophil', 'Lebensmittel', 'Hefe', 3, 'Kann Milchzucker vergären – selten bei Hefen.'],
  ['Candida albicans', 'Weiße Hefe', 'P', 'Darmflora', 'Zucker', 'fakultativ', 'mesophil', 'Mund', 'Hefe', 2, 'Kann zwischen Hefe- und Fadenform wechseln.'],
  ['Candidozyma auris', 'Ohrhefe', 'P', 'Humanpathogene', 'Zucker', 'aerob', 'mesophil', 'Haut', 'Hefe', 3, '2009 im Ohr einer Patientin in Japan entdeckt.'],
  ['Malassezia globosa', 'Schuppen-Hefe', 'P', 'Hautflora', 'Talg', 'aerob', 'mesophil', 'Haut', 'Hefe', 3, 'Frisst Hautfett und ist an Kopfschuppen beteiligt.'],
  ['Cryptococcus neoformans', 'Tauben-Kryptokokke', 'P', 'Humanpathogene', 'Dung', 'aerob', 'mesophil', 'Dung', 'Hefe', 3, 'Lebt in Taubenkot und hat eine dicke Zuckerkapsel.'],
  ['Rhodotorula mucilaginosa', 'Rosa Hefe', 'P', 'Saprotrophe', 'Zucker', 'aerob', 'mesophil', 'Haushalt', 'Hefe', 2, 'Der rosa Belag im Duschvorhang.'],
  ['Yarrowia lipolytica', 'Fett-Hefe', 'P', 'Saprotrophe', 'Fette', 'aerob', 'mesophil', 'Lebensmittel', 'Hefe', 3, 'Frisst Öle und Fette und wird für Biotreibstoff erforscht.'],
  ['Komagataella phaffii', 'Methanol-Hefe', 'P', 'Methylotrophe', 'Methanol', 'aerob', 'mesophil', 'Pflanze', 'Hefe', 3, 'Früher Pichia pastoris – Proteinfabrik der Biotechnologie.'],
  ['Aureobasidium pullulans', 'Schwarze Hefe', 'P', 'Saprotrophe', 'Zucker', 'aerob', 'mesophil', 'Pflanze', 'Hefe', 2, 'Bildet Pullulan, einen essbaren Film für Kapseln.'],

  /* ===================== PILZE: SCHIMMEL ===================== */
  ['Penicillium rubens', 'Penicillin-Pinselschimmel', 'P', 'Antibiotikabildner', 'Zucker', 'aerob', 'mesophil', 'Lebensmittel', 'Hyphe', 2, 'Flemings Schimmel von 1928 – früher als P. notatum bekannt.'],
  ['Penicillium chrysogenum', 'Goldener Pinselschimmel', 'P', 'Antibiotikabildner', 'Zucker', 'aerob', 'mesophil', 'Lebensmittel', 'Hyphe', 3, 'Ein Stamm von einer schimmeligen Melone aus Peoria ermöglichte Massenproduktion von Penicillin.'],
  ['Penicillium roqueforti', 'Blauschimmel', 'P', 'Schimmelpilze', 'Laktose', 'aerob', 'psychrophil', 'Lebensmittel', 'Hyphe', 2, 'Die blauen Adern im Roquefort.'],
  ['Penicillium camemberti', 'Camembert-Schimmel', 'P', 'Schimmelpilze', 'Laktose', 'aerob', 'mesophil', 'Lebensmittel', 'Hyphe', 2, 'Der weiße Flaum auf Camembert und Brie.'],
  ['Penicillium digitatum', 'Grünfäule der Zitrusfrüchte', 'P', 'Schimmelpilze', 'Zucker', 'aerob', 'mesophil', 'Lebensmittel', 'Hyphe', 3, 'Der grüne Pelz auf vergessenen Orangen.'],
  ['Aspergillus niger', 'Schwarzer Gießkannenschimmel', 'P', 'Schimmelpilze', 'Zucker', 'aerob', 'mesophil', 'Boden', 'Hyphe', 1, 'Produziert fast die gesamte Zitronensäure der Welt.'],
  ['Aspergillus oryzae', 'Koji-Schimmel', 'P', 'Schimmelpilze', 'Stärke', 'aerob', 'mesophil', 'Lebensmittel', 'Hyphe', 2, 'Japans Nationalpilz: Grundlage für Sake, Miso und Sojasoße.'],
  ['Aspergillus fumigatus', 'Kompost-Gießkannenschimmel', 'P', 'Schimmelpilze', 'Humus', 'aerob', 'thermophil', 'Kompost', 'Hyphe', 2, 'Wächst noch bei 50 °C im Kompost.'],
  ['Aspergillus flavus', 'Gelber Gießkannenschimmel', 'P', 'Schimmelpilze', 'Stärke', 'aerob', 'mesophil', 'Pflanze', 'Hyphe', 3, 'Befällt Erdnüsse und Mais und bildet Aflatoxine.'],
  ['Rhizopus stolonifer', 'Brotschimmel', 'P', 'Schimmelpilze', 'Stärke', 'aerob', 'mesophil', 'Lebensmittel', 'Hyphe', 1, 'Der schwarz gepunktete Flaum auf altem Brot.'],
  ['Rhizopus microsporus', 'Tempeh-Pilz', 'P', 'Schimmelpilze', 'Stärke', 'aerob', 'mesophil', 'Lebensmittel', 'Hyphe', 3, 'Verwebt Sojabohnen zu Tempeh.'],
  ['Mucor mucedo', 'Köpfchenschimmel', 'P', 'Schimmelpilze', 'Dung', 'aerob', 'mesophil', 'Dung', 'Hyphe', 2, 'Trägt winzige Sporenkugeln auf langen Stielen.'],
  ['Pilobolus crystallinus', 'Kanonen-Pilz', 'P', 'Saprotrophe', 'Dung', 'aerob', 'mesophil', 'Dung', 'Hyphe', 4, 'Schießt seine Sporen mit 20.000-facher Erdbeschleunigung bis 2,5 m weit.'],
  ['Neurospora crassa', 'Roter Brotschimmel', 'P', 'Schimmelpilze', 'Zucker', 'aerob', 'mesophil', 'Pflanze', 'Hyphe', 3, 'Führte zur „Ein Gen – ein Enzym“-Hypothese (Nobelpreis 1958).'],
  ['Thermomyces lanuginosus', 'Hitze-Wollpilz', 'P', 'Thermophile', 'Humus', 'aerob', 'thermophil', 'Kompost', 'Hyphe', 3, 'Seine Lipase steckt in vielen Waschmitteln.'],
  ['Neocallimastix frontalis', 'Pansen-Pilz', 'P', 'Zersetzer', 'Cellulose', 'anaerob', 'mesophil', 'Darm', 'Spore', 4, 'Einer der wenigen Pilze ohne Sauerstoffbedarf – zerlegt Gras im Kuhmagen.'],
  ['Physarum polycephalum', 'Vielköpfiger Schleimpilz', 'P', 'Schleimpilze', 'Beutebakterien', 'aerob', 'mesophil', 'Holz', 'Plasmodium', 3, 'Kein echter Pilz – findet aber den kürzesten Weg durch ein Labyrinth.'],

  /* ===================== PILZE: PARASITEN ===================== */
  ['Botrytis cinerea', 'Grauschimmel', 'P', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Hyphe', 2, 'Als „Edelfäule“ macht er Trauben zu Süßweinen wie Sauternes.'],
  ['Fusarium graminearum', 'Ährenfusarium', 'P', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Hyphe', 3, 'Färbt Weizenähren rosa.'],
  ['Fusarium venenatum', 'Quorn-Pilz', 'P', 'Saprotrophe', 'Zucker', 'aerob', 'mesophil', 'Boden', 'Hyphe', 4, 'Wird im Fermenter zu Fleischersatz (Mykoprotein) gezüchtet.'],
  ['Pyricularia oryzae', 'Reisbräune', 'P', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Spore', 3, 'Durchstößt Blätter mit enormem Turgordruck.'],
  ['Puccinia graminis', 'Schwarzrost', 'P', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Spore', 3, 'Braucht zwei Wirte: Getreide und Berberitze.'],
  ['Phytophthora infestans', 'Kraut- und Knollenfäule', 'P', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Hyphe', 3, 'Kein echter Pilz, sondern ein Eipilz – löste die irische Hungersnot 1845 aus.'],
  ['Ustilago maydis', 'Maisbeulenbrand', 'P', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Spore', 3, 'In Mexiko eine Delikatesse: Huitlacoche.'],
  ['Claviceps purpurea', 'Mutterkorn', 'P', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Hyphe', 3, 'Verursachte im Mittelalter das „Antoniusfeuer“; Ausgangsstoff mancher Medikamente.'],
  ['Cryphonectria parasitica', 'Kastanienrindenkrebs', 'P', 'Pflanzenpathogene', 'Holz', 'aerob', 'mesophil', 'Holz', 'Hyphe', 4, 'Tötete im 20. Jh. fast alle amerikanischen Kastanien.'],
  ['Ophiostoma novo-ulmi', 'Ulmensterben', 'P', 'Pflanzenpathogene', 'Holz', 'aerob', 'mesophil', 'Holz', 'Hyphe', 4, 'Wird von Ulmensplintkäfern verbreitet.'],
  ['Hymenoscyphus fraxineus', 'Falsches Weißes Stängelbecherchen', 'P', 'Pflanzenpathogene', 'Pflanzensaft', 'aerob', 'mesophil', 'Pflanze', 'Fruchtkörper', 4, 'Verursacht das Eschentriebsterben in Europa.'],
  ['Batrachochytrium dendrobatidis', 'Amphibien-Chytridpilz', 'P', 'Tierpathogene', 'Keratin', 'aerob', 'mesophil', 'Süßwasser', 'Spore', 4, 'Befällt die Haut von Fröschen weltweit.'],
  ['Pseudogymnoascus destructans', 'Weißnasen-Pilz', 'P', 'Tierpathogene', 'Keratin', 'aerob', 'psychrophil', 'Höhle', 'Hyphe', 4, 'Befällt winterschlafende Fledermäuse in kalten Höhlen.'],
  ['Trichophyton rubrum', 'Fußpilz', 'P', 'Hautpilze', 'Keratin', 'aerob', 'mesophil', 'Haut', 'Hyphe', 2, 'Der häufigste Hautpilz des Menschen.'],
  ['Beauveria bassiana', 'Weiße Muscardine', 'P', 'Insektenpathogene', 'Insekten', 'aerob', 'mesophil', 'Boden', 'Hyphe', 3, 'Agostino Bassi bewies 1835 an ihr, dass Mikroben Krankheiten verursachen.'],
  ['Metarhizium robertsii', 'Grüne Muscardine', 'P', 'Insektenpathogene', 'Insekten', 'aerob', 'mesophil', 'Boden', 'Hyphe', 3, 'Biologisches Insektizid, das Insekten-Stickstoff an Pflanzen weitergibt.'],
  ['Ophiocordyceps unilateralis', 'Zombie-Ameisen-Pilz', 'P', 'Insektenpathogene', 'Insekten', 'aerob', 'mesophil', 'Gliederfüßer', 'Fruchtkörper', 4, 'Steuert Ameisen auf ein Blatt, bevor er aus ihrem Kopf wächst.'],
  ['Cordyceps militaris', 'Puppen-Kernkeule', 'P', 'Insektenpathogene', 'Insekten', 'aerob', 'mesophil', 'Gliederfüßer', 'Fruchtkörper', 3, 'Orange Keulen wachsen aus Schmetterlingspuppen.'],
  ['Entomophthora muscae', 'Fliegen-Pilz', 'P', 'Insektenpathogene', 'Insekten', 'aerob', 'mesophil', 'Gliederfüßer', 'Spore', 4, 'Infizierte Fliegen klettern nach oben und schießen von dort Sporen ab.'],
  ['Arthrobotrys oligospora', 'Fadenwurm-Fänger', 'P', 'Nematodenfänger', 'Fadenwürmer', 'aerob', 'mesophil', 'Boden', 'Hyphe', 4, 'Baut klebrige Netze aus Hyphen, um Fadenwürmer zu fangen.'],

  /* ===================== PILZE: SYMBIOSE ===================== */
  ['Rhizophagus irregularis', 'Arbuskulärer Mykorrhizapilz', 'P', 'Mykorrhiza', 'Wurzelexsudate', 'aerob', 'mesophil', 'Boden', 'Hyphe', 3, 'Verbündet sich mit über 70 % aller Landpflanzen.'],
  ['Amanita muscaria', 'Fliegenpilz', 'P', 'Mykorrhiza', 'Wurzelexsudate', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 2, 'Der ikonische rote Pilz – Partner von Birken und Fichten. Giftig!'],
  ['Boletus edulis', 'Steinpilz', 'P', 'Mykorrhiza', 'Wurzelexsudate', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 2, 'Lässt sich nicht züchten, weil er lebende Bäume braucht.'],
  ['Cantharellus cibarius', 'Pfifferling', 'P', 'Mykorrhiza', 'Wurzelexsudate', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 2, 'Hat Leisten statt echter Lamellen.'],
  ['Tuber melanosporum', 'Périgord-Trüffel', 'P', 'Mykorrhiza', 'Wurzelexsudate', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 4, 'Wächst unterirdisch an Eichen – wird von Hunden gesucht.'],
  ['Tuber magnatum', 'Weiße Alba-Trüffel', 'P', 'Mykorrhiza', 'Wurzelexsudate', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 5, 'Einer der teuersten Pilze der Welt.'],
  ['Laccaria bicolor', 'Zweifarbiger Lacktrichterling', 'P', 'Mykorrhiza', 'Wurzelexsudate', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 3, 'Fängt Springschwänze und gibt deren Stickstoff an Bäume weiter.'],
  ['Pisolithus arhizus', 'Erbsenstreuling', 'P', 'Mykorrhiza', 'Wurzelexsudate', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 3, 'Hilft Bäumen, auf verwüsteten Bergbauflächen zu wachsen.'],
  ['Xanthoria parietina', 'Gewöhnliche Gelbflechte', 'P', 'Flechtenpilze', 'Licht', 'aerob', 'mesophil', 'Holz', 'Flechte', 2, 'Gelbe Rosetten auf Rinde und Mauern – liebt Stickstoff.'],
  ['Cladonia rangiferina', 'Rentierflechte', 'P', 'Flechtenpilze', 'Licht', 'aerob', 'psychrophil', 'Boden', 'Flechte', 3, 'Winterfutter der Rentiere in der Tundra.'],
  ['Usnea barbata', 'Bartflechte', 'P', 'Flechtenpilze', 'Licht', 'aerob', 'mesophil', 'Holz', 'Flechte', 3, 'Hängt wie ein Bart von Bäumen – Zeiger für saubere Luft.'],

  /* ===================== PILZE: HOLZ & FÄULE ===================== */
  ['Armillaria ostoyae', 'Dunkler Hallimasch', 'P', 'Weißfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 5, 'Ein Exemplar in Oregon bedeckt fast 10 km² – eines der größten Lebewesen der Erde.'],
  ['Armillaria mellea', 'Honiggelber Hallimasch', 'P', 'Weißfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 2, 'Sein Myzel lässt morsches Holz im Dunkeln leuchten.'],
  ['Pleurotus ostreatus', 'Austernseitling', 'P', 'Weißfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 1, 'Lähmt und frisst Fadenwürmer – als Ergänzung zu Holz.'],
  ['Trametes versicolor', 'Schmetterlingstramete', 'P', 'Weißfäulepilze', 'Lignin', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 1, 'Bunte Ringe wie ein Truthahnschwanz.'],
  ['Phanerodontia chrysosporium', 'Lignin-Zerleger', 'P', 'Weißfäulepilze', 'Lignin', 'aerob', 'thermophil', 'Holz', 'Hyphe', 3, 'Baut Lignin ab – und dabei sogar Sprengstoff-Rückstände.'],
  ['Lentinula edodes', 'Shiitake', 'P', 'Weißfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 1, 'Wird seit über 800 Jahren auf Holzstämmen kultiviert.'],
  ['Ganoderma lucidum', 'Glänzender Lackporling', 'P', 'Weißfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 2, 'Lackglänzender Pilz, in Asien als „Reishi“ bekannt.'],
  ['Fomes fomentarius', 'Zunderschwamm', 'P', 'Weißfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 2, 'Ötzi trug ihn vor 5300 Jahren als Feuerstarter bei sich.'],
  ['Schizophyllum commune', 'Gemeiner Spaltblättling', 'P', 'Weißfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 3, 'Hat über 20.000 verschiedene Paarungstypen.'],
  ['Mycena chlorophos', 'Leuchtender Helmling', 'P', 'Saprotrophe', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 4, 'Leuchtet nachts grün im tropischen Regenwald.'],
  ['Serpula lacrymans', 'Echter Hausschwamm', 'P', 'Braunfäulepilze', 'Holz', 'aerob', 'mesophil', 'Haushalt', 'Fruchtkörper', 3, 'Frisst Dachbalken und „weint“ dabei Wassertropfen.'],
  ['Fomitopsis pinicola', 'Rotrandiger Baumschwamm', 'P', 'Braunfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 2, 'Lässt Nadelholz würfelig zerfallen.'],
  ['Laetiporus sulphureus', 'Schwefelporling', 'P', 'Braunfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 2, 'Leuchtend gelbe Konsolen – das „Waldhuhn“.'],
  ['Agaricus bisporus', 'Champignon', 'P', 'Saprotrophe', 'Dung', 'aerob', 'mesophil', 'Kompost', 'Fruchtkörper', 1, 'Der meistgegessene Speisepilz der Welt.'],
  ['Coprinus comatus', 'Schopftintling', 'P', 'Saprotrophe', 'Humus', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 2, 'Löst sich selbst in schwarze Tinte auf.'],
  ['Morchella esculenta', 'Speisemorchel', 'P', 'Saprotrophe', 'Humus', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 3, 'Erscheint oft nach Waldbränden.'],
  ['Phallus impudicus', 'Stinkmorchel', 'P', 'Saprotrophe', 'Humus', 'aerob', 'mesophil', 'Boden', 'Fruchtkörper', 2, 'Lockt mit Aasgeruch Fliegen an, die ihre Sporen verbreiten.'],
  ['Hericium erinaceus', 'Igel-Stachelbart', 'P', 'Weißfäulepilze', 'Holz', 'aerob', 'mesophil', 'Holz', 'Fruchtkörper', 3, 'Sieht aus wie ein weißer Wasserfall aus Stacheln.'],

  /* ===================== PILZE: EXTREMOPHILE ===================== */
  ['Cryomyces antarcticus', 'Antarktischer Felsenpilz', 'P', 'Psychrophile', 'Gelöste Organik', 'aerob', 'psychrophil', 'Felsen', 'Hefe', 5, 'Lebt in antarktischem Gestein und überstand Monate außen an der ISS.'],
  ['Cladosporium sphaerospermum', 'Reaktor-Schwärzepilz', 'P', 'Strahlenresistente', 'Gelöste Organik', 'aerob', 'mesophil', 'Reaktor', 'Hyphe', 5, 'Wächst an den Wänden in Tschernobyl und scheint Strahlung mit Melanin zu nutzen.'],
  ['Exophiala dermatitidis', 'Spülmaschinen-Pilz', 'P', 'Thermophile', 'Gelöste Organik', 'aerob', 'thermophil', 'Haushalt', 'Hefe', 4, 'Liebt heiße, feuchte Spülmaschinendichtungen.'],
  ['Hortaea werneckii', 'Salz-Schwarzhefe', 'P', 'Halophile', 'Salzlake', 'aerob', 'mesophil', 'Salzsee', 'Hefe', 4, 'Wächst in fast gesättigter Salzlösung.'],
  ['Wallemia ichthyophaga', 'Salzfisch-Pilz', 'P', 'Halophile', 'Salzlake', 'aerob', 'mesophil', 'Salzsee', 'Hyphe', 4, 'Der salzliebendste bekannte Pilz – braucht mindestens 1,5 M Salz.'],

  /* ===================== VIREN: BAKTERIOPHAGEN ===================== */
  ['Escherichia-Phage T4', 'Mondlander-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Darm', 'Kopf-Schwanz', 2, 'Sieht aus wie eine Mondlandefähre und injiziert DNA wie eine Spritze.'],
  ['Escherichia-Phage T7', 'Turbo-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Darm', 'Kopf-Schwanz', 2, 'Seine RNA-Polymerase ist ein Standardwerkzeug im Labor.'],
  ['Escherichia-Phage Lambda', 'Lambda-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Darm', 'Kopf-Schwanz', 2, 'Entscheidet, ob er sofort tötet oder sich still ins Genom einbaut.'],
  ['Escherichia-Phage phiX174', 'PhiX-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Darm', 'Ikosaeder', 3, '1977 das erste vollständig sequenzierte DNA-Genom (Fred Sanger).'],
  ['Escherichia-Phage MS2', 'MS2-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Kläranlage', 'Ikosaeder', 3, '1976 das erste vollständig sequenzierte Genom überhaupt.'],
  ['Escherichia-Phage M13', 'Faden-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Darm', 'Faden', 3, 'Grundlage des Phagen-Displays – Nobelpreis Chemie 2018.'],
  ['Pseudomonas-Phage phi6', 'Behüllter Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Pflanze', 'Hülle', 4, 'Einer der wenigen Phagen mit Lipidhülle.'],
  ['Pseudomonas-Phage phiKZ', 'Jumbo-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Süßwasser', 'Kopf-Schwanz', 4, 'Baut im Bakterium einen zellkernähnlichen Schutzraum.'],
  ['Carjivirus communis', 'crAssphage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Darm', 'Kopf-Schwanz', 4, '2014 per Computer entdeckt – der häufigste Phage im menschlichen Darm.'],
  ['Bacillus-Phage phi29', 'Motor-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Boden', 'Kopf-Schwanz', 3, 'Hat einen der stärksten molekularen Motoren zum Verpacken von DNA.'],
  ['Vibrio-Phage CTXphi', 'Toxin-Phage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Süßwasser', 'Faden', 4, 'Trägt das Gen für das Choleratoxin.'],
  ['Pelagibacter-Phage HTVC010P', 'Pelagiphage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Meer', 'Kopf-Schwanz', 4, 'Gilt als einer der häufigsten Viren im Ozean.'],
  ['Prochlorococcus-Phage P-SSP7', 'Cyanophage', 'V', 'Bakteriophagen', 'Wirt: Bakterium', '—', 'mesophil', 'Meer', 'Kopf-Schwanz', 4, 'Bringt eigene Photosynthese-Gene mit, um seinen Wirt am Laufen zu halten.'],

  /* ===================== VIREN: ARCHAEEN ===================== */
  ['Sulfolobus-Spindelvirus SSV1', 'Spindelvirus', 'V', 'Archaeenviren', 'Wirt: Archaeon', '—', 'hyperthermophil', 'Heiße Quelle', 'Spindel', 4, 'Zitronenförmig – solche Formen gibt es nur bei Archaeenviren.'],
  ['Acidianus-Zweischwanzvirus', 'Zweischwanz-Virus', 'V', 'Archaeenviren', 'Wirt: Archaeon', '—', 'hyperthermophil', 'Heiße Quelle', 'Spindel', 5, 'Lässt sich außerhalb des Wirts zwei Schwänze wachsen.'],
  ['Sulfolobus-Türmchen-Ikosaedervirus', 'Türmchenvirus', 'V', 'Archaeenviren', 'Wirt: Archaeon', '—', 'hyperthermophil', 'Heiße Quelle', 'Ikosaeder', 5, 'Verlässt seinen Wirt durch pyramidenförmige Öffnungen.'],
  ['Acidianus-Flaschenvirus', 'Flaschenvirus', 'V', 'Archaeenviren', 'Wirt: Archaeon', '—', 'hyperthermophil', 'Heiße Quelle', 'Flasche', 5, 'Geformt wie eine Weinflasche – einzigartig in der Virenwelt.'],

  /* ===================== VIREN: PFLANZEN ===================== */
  ['Tabakmosaikvirus', 'TMV', 'V', 'Pflanzenviren', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Helikal', 2, 'Das erste entdeckte Virus (Beijerinck 1898) – extrem stabil.'],
  ['Gurkenmosaikvirus', 'CMV', 'V', 'Pflanzenviren', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Ikosaeder', 2, 'Befällt über 1200 Pflanzenarten.'],
  ['Blumenkohlmosaikvirus', 'CaMV', 'V', 'Pflanzenviren', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Ikosaeder', 3, 'Sein 35S-Promotor ist ein Grundwerkzeug der Pflanzen-Gentechnik.'],
  ['Kartoffelvirus Y', 'PVY', 'V', 'Pflanzenviren', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Faden', 3, 'Wird von Blattläusen übertragen.'],
  ['Tulpenmosaikvirus', 'Tulpenbrechvirus', 'V', 'Pflanzenviren', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Faden', 4, 'Erzeugte die geflammten Tulpen der Tulpenmanie im 17. Jh.'],
  ['Tomatenbronzefleckenvirus', 'TSWV', 'V', 'Pflanzenviren', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Hülle', 3, 'Behülltes Pflanzenvirus, übertragen von Thripsen.'],
  ['Maisstrichelvirus', 'MSV', 'V', 'Pflanzenviren', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Ikosaeder', 4, 'Zwillingsvirus aus zwei verschmolzenen Ikosaedern.'],
  ['Citrus-Tristeza-Virus', 'CTV', 'V', 'Pflanzenviren', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Faden', 4, '„Tristeza“ heißt Traurigkeit – es tötete Millionen Orangenbäume.'],
  ['Kartoffelspindelknollen-Viroid', 'PSTVd', 'V', 'Viroide', 'Wirt: Pflanze', '—', 'mesophil', 'Pflanze', 'Kapsidlos', 5, 'Nur ein nackter RNA-Ring ohne Hülle und ohne Gene für Proteine.'],

  /* ===================== VIREN: RIESEN & ALGEN & PILZE ===================== */
  ['Acanthamoeba polyphaga mimivirus', 'Mimivirus', 'V', 'Riesenviren', 'Wirt: Amöbe', '—', 'mesophil', 'Süßwasser', 'Riesenkapsid', 4, 'So groß, dass man es zuerst für ein Bakterium hielt.'],
  ['Pandoravirus salinus', 'Pandoravirus', 'V', 'Riesenviren', 'Wirt: Amöbe', '—', 'mesophil', 'Meer', 'Amphore', 5, 'Die meisten seiner Gene sind nirgendwo sonst bekannt.'],
  ['Pithovirus sibericum', 'Permafrost-Riesenvirus', 'V', 'Riesenviren', 'Wirt: Amöbe', '—', 'psychrophil', 'Eis', 'Amphore', 5, '30.000 Jahre im Permafrost – und noch infektiös für Amöben.'],
  ['Megavirus chilensis', 'Megavirus', 'V', 'Riesenviren', 'Wirt: Amöbe', '—', 'mesophil', 'Meer', 'Riesenkapsid', 5, 'Vor der Küste Chiles entdeckt, noch größer als Mimivirus.'],
  ['Tupanvirus', 'Tupanvirus', 'V', 'Riesenviren', 'Wirt: Amöbe', '—', 'mesophil', 'Salzsee', 'Riesenkapsid', 5, 'Hat einen langen Schwanz und fast alle Gene für die Proteinherstellung.'],
  ['Sputnik-Virophage', 'Sputnik', 'V', 'Virophagen', 'Wirt: Riesenvirus', '—', 'mesophil', 'Süßwasser', 'Ikosaeder', 5, 'Ein Virus, das andere Viren befällt – benannt nach dem ersten Satelliten.'],
  ['Emiliania-huxleyi-Virus 86', 'Kalkalgen-Virus', 'V', 'Algenviren', 'Wirt: Alge', '—', 'mesophil', 'Meer', 'Ikosaeder', 4, 'Beendet riesige Algenblüten, die man aus dem All sieht.'],
  ['Paramecium-bursaria-Chlorella-Virus 1', 'Chlorovirus', 'V', 'Algenviren', 'Wirt: Alge', '—', 'mesophil', 'Süßwasser', 'Ikosaeder', 4, 'Bohrt sich mit einem Stachel in Grünalgen.'],
  ['Cryphonectria-Hypovirus 1', 'Kastanien-Retter-Virus', 'V', 'Pilzviren', 'Wirt: Pilz', '—', 'mesophil', 'Holz', 'Kapsidlos', 5, 'Schwächt den Kastanienrindenkrebs – ein Virus als Baumretter.'],

  /* ===================== VIREN: MENSCH & TIER ===================== */
  ['Influenza-A-Virus', 'Grippevirus', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Atemwege', 'Hülle', 1, 'Tauscht Gensegmente aus – darum braucht es jedes Jahr eine neue Impfung.'],
  ['Rhinovirus A', 'Schnupfenvirus', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Atemwege', 'Ikosaeder', 1, 'Mag es kühl – vermehrt sich am besten in der Nase bei 33 °C.'],
  ['SARS-CoV-2', 'Coronavirus', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Atemwege', 'Hülle', 1, 'Benannt nach der Krone (lat. corona) aus Spike-Proteinen.'],
  ['Norovirus', 'Magen-Darm-Virus', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Darm', 'Ikosaeder', 1, 'Schon wenige Viruspartikel reichen für eine Ansteckung.'],
  ['Rotavirus A', 'Rotavirus', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Darm', 'Ikosaeder', 2, 'Sieht unter dem Mikroskop aus wie ein Rad (lat. rota).'],
  ['Humanes Papillomvirus 16', 'HPV', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Haut', 'Ikosaeder', 2, 'Harald zur Hausen erhielt 2008 den Nobelpreis für den Krebs-Zusammenhang.'],
  ['Herpes-simplex-Virus 1', 'Lippenherpes', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Mund', 'Hülle', 1, 'Versteckt sich lebenslang in Nervenzellen.'],
  ['Varizella-Zoster-Virus', 'Windpocken', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Haut', 'Hülle', 2, 'Kommt Jahrzehnte später als Gürtelrose zurück.'],
  ['Epstein-Barr-Virus', 'Kusskrankheit', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Mund', 'Hülle', 2, '1964 das erste beim Menschen gefundene Tumorvirus.'],
  ['Masernvirus', 'Masern', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Atemwege', 'Hülle', 2, 'Eines der ansteckendsten Viren – Impfung schützt sehr gut.'],
  ['Poliovirus', 'Kinderlähmung', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Darm', 'Ikosaeder', 3, 'Dank Impfungen von Jonas Salk und Albert Sabin fast ausgerottet.'],
  ['Humanes Immundefizienz-Virus 1', 'HIV', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Blut', 'Hülle', 2, 'Ein Retrovirus: schreibt seine RNA in DNA um.'],
  ['Humanes Adenovirus 5', 'Adenovirus', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Atemwege', 'Ikosaeder', 2, 'Mit Fasern an den Ecken – beliebter Vektor in der Gentherapie.'],
  ['Zikavirus', 'Zika', 'V', 'Humanviren', 'Wirt: Mensch', '—', 'mesophil', 'Blut', 'Hülle', 3, 'Benannt nach dem Zika-Wald in Uganda.'],
  ['Tollwutvirus', 'Tollwut', 'V', 'Tierviren', 'Wirt: Tier', '—', 'mesophil', 'Tier', 'Projektil', 3, 'Geformt wie eine Gewehrkugel; Louis Pasteur entwickelte 1885 den Impfstoff.'],
  ['Myxomavirus', 'Kaninchen-Myxomatose', 'V', 'Tierviren', 'Wirt: Tier', '—', 'mesophil', 'Tier', 'Hülle', 4, 'Wurde in Australien gegen Kaninchen eingesetzt – ein Lehrstück der Evolution.'],
  ['Rinderpestvirus', 'Rinderpest', 'V', 'Tierviren', 'Wirt: Tier', '—', 'mesophil', 'Tier', 'Hülle', 5, '2011 offiziell ausgerottet – nach den Pocken die zweite besiegte Viruskrankheit.'],
  ['Flügeldeformationsvirus', 'Bienenvirus', 'V', 'Insektenviren', 'Wirt: Insekt', '—', 'mesophil', 'Gliederfüßer', 'Ikosaeder', 4, 'Wird von der Varroa-Milbe auf Honigbienen übertragen.'],
  ['Autographa-californica-Nukleopolyedervirus', 'Bakulovirus', 'V', 'Insektenviren', 'Wirt: Insekt', '—', 'mesophil', 'Gliederfüßer', 'Stabkapsid', 4, 'Schützt sich in Proteinkristallen und ist ein Werkzeug der Impfstoffproduktion.'],
  ];

  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const MICROBES = RAW.map(r => ({
    id: slug(r[0]),
    name: r[0], de: r[1], type: TYPES[r[2]], typeCode: r[2], guild: r[3],
    guildGroup: GUILDS[r[3]], substrate: r[4], substrateGroup: SUBSTRATES[r[4]],
    oxygen: r[5], temp: r[6], habitat: r[7], habitatGroup: HABITATS[r[7]],
    form: r[8], formGroup: FORMS[r[8]], rarity: r[9], fact: r[10],
  }));

  /* Selbsttest der Vokabeln – Fehler landen in der Konsole */
  const seen = new Set();
  MICROBES.forEach(m => {
    const bad = [];
    if (!m.type) bad.push('Typ');
    if (!m.guildGroup) bad.push('Gilde ' + m.guild);
    if (!m.substrateGroup) bad.push('Nährboden ' + m.substrate);
    if (!m.habitatGroup) bad.push('Habitat ' + m.habitat);
    if (!m.formGroup) bad.push('Form ' + m.form);
    if (m.oxygen !== '—' && !OXYGEN.includes(m.oxygen)) bad.push('O2 ' + m.oxygen);
    if (!TEMPS.includes(m.temp)) bad.push('Temp ' + m.temp);
    if (!RARITY[m.rarity]) bad.push('Seltenheit');
    if (seen.has(m.id)) bad.push('doppelte ID');
    seen.add(m.id);
    if (bad.length) console.warn('[Germle-Daten]', m.name, bad.join(', '));
  });

  const GROUP_COLORS = {
    'Stickstoff': '#4fc3ff', 'Schwefel': '#fff04a', 'Eisen & Metalle': '#b5532a',
    'Methan & Gase': '#c8f7e0', 'Licht': '#3ddc4a', 'Abbau': '#5b4632', 'Gärung': '#ff9bd2',
    'Symbiose': '#c45cff', 'Parasiten': '#ff2d4f', 'Extremophile': '#2f4bff',
    'Holz & Fäule': '#fbf7ee', 'Viren': '#20e3d0',
  };

  return { MICROBES, GUILDS, SUBSTRATES, HABITATS, FORMS, OXYGEN, TEMPS, RARITY, GROUP_COLORS };
})();
