/**
 * روابط إنجليزية قصيرة للأعمال، بدل الروابط المحوّلة حرفياً من العناوين العربية.
 * المفتاح: الرابط الحالي (المولَّد تلقائياً) — القيمة: الرابط الجديد.
 * تُطبَّق من لوحة التحكم بزر واحد، والرابط القديم يُحفظ في previousSlugs
 * فيبقى يعمل ويحوِّل إلى الجديد.
 */
export const WORK_SLUG_MAP: Record<string, string> = {
  "mnshurat-sushl-midia-bia-al-siarat-al-mstamla": "used-cars-social-media",
  "hkdha-bda-dirbi-milanu-tarf-ala-qsa-dirbi-dila-madunina-w-sr": "milan-derby-story",
  "aml-ttuai-lfaida-jmaia-al-atfal-aula-sltna-aman": "children-first-oman-volunteer",
  "diburtifu-lakurunia-qsa-btl-dl-triqh": "deportivo-la-coruna-story",
  "hiaa-al-shikh-nhnah-rhmh-al-lh": "sheikh-nahnah-life",
  "al-asir-al-mksiki-al-dhi-nja-mn-al-aadam-b9-rsasat-ahdaha-fi": "mexican-prisoner-survived-execution",
  "dirbi-al-mirsisaid-mn-dirbi-al-asdqa-al-a-dirbi-al-adaua": "merseyside-derby-story",
  "qsa-al-rjl-al-dhi-anazl-an-al-aalm-wlm-ytklm-lmda-27-aam": "man-silent-for-27-years",
  "tghtia-mard-nadi-al-shbab-jamaa-yhia-fars-al-mdia": "youth-club-fair-medea",
  "ahdath-mtfjra-wfdaih-mtzaida-bin-ailun-mask-wa-al-ysar": "elon-musk-vs-the-left",
  "tqdim-al-duri-al-frnsi": "ligue-1-preview",
  "qsa-al-rjl-al-dhi-aash-tht-al-bhr-ma-asmak-al-qrsh-lmda-72": "man-who-lived-with-sharks",
  "mnshurat-sushl-midia-al-nsrin-lmuad-al-bna": "al-nasreen-social-media",
  "bhira-al-hiakl-al-azmia-lm-ysma-bha-al-kthirun": "lake-of-skeletons",
  "mnshurat-sushl-midia-al-qma-lil-tjara-al-alktrunia": "qimma-shop-social-media",
  "tshilsi-abramufitsh-ma-bin-al-riada-w-al-siasa": "chelsea-abramovich-story",
  "aalan-lmhl-al-nsrin-fi-sltna-aman": "al-nasreen-store-ad",
  "mnshurat-sushl-midia-aiada-asnan": "dental-clinic-social-media",
  "al-jndi-al-mjri-al-dhi-qda-40-aama-mn-hiath-bdun-num": "soldier-40-years-without-sleep",
  "mnshurat-sushl-midia-fnian-kafih": "fanyan-cafe-social-media",
  "mn-aalm-riadiat-abqri-al-a-mjrm-khtir-hir-al-af-bi-ai": "genius-mathematician-fbi-story",
  "aalan-tghtia-kas-asia-wkas-afriqia-mn-sfha-the-footix": "the-footix-cup-coverage-ad",
  "mnshurat-sushl-midia-mdrsa-khasa": "private-school-social-media",
  "qsa-al-tfl-aqbal-al-dhi-njh-bthrir-al-af-al-atfal-mn": "iqbal-masih-story",
  "qsa-al-tuam-al-thlatha-al-dhin-hulhm-aalm-mjnun-al-a-firan": "three-identical-strangers",
  "jlsa-tsuir-azia-tqlidia-jzairia": "algerian-traditional-dress-shoot",
  "fidiu-mushn-jrafik-lmuqa-snd-midia-al-mnsa-al-aalamia": "sanad-media-motion-video",
  "qsa-kristianu-runaldu-mn-tfula-baisa-al-a-njm-azim": "cristiano-ronaldo-story",
  "tsuir-mnaqshat-al-tkhrj": "graduation-defense-photos",
};
