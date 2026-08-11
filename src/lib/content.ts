export type ContentSection = {
  id: string;
  label: string;
  title: string;
  body: string;
  accentColor: string;
  /** Spherical coordinates (degrees) of this section's hotspot. */
  position: { lat: number; lon: number };
};

export const studio = {
  name: "ORBIT",
  tagline: "Creative & Design Studio",
};

export const sections: ContentSection[] = [
  {
    id: "about",
    label: "About",
    title: "About ORBIT",
    body: "私たちは、ブランドの核にある「らしさ」を可視化するクリエイティブスタジオです。戦略から表現まで、一貫した視点でものづくりに向き合っています。",
    accentColor: "#f2545b",
    position: { lat: 12, lon: 0 },
  },
  {
    id: "works",
    label: "Works",
    title: "Selected Works",
    body: "ブランディング、Webサイト、映像、空間デザインまで。業種を問わず、クライアントの課題に合わせた表現を追求してきました。",
    accentColor: "#4f9dff",
    position: { lat: -8, lon: 72 },
  },
  {
    id: "services",
    label: "Services",
    title: "Services",
    body: "ブランド戦略設計 / ビジュアルアイデンティティ / Webデザイン・開発 / 映像制作。企画から実装まで、ワンストップで伴走します。",
    accentColor: "#ffb74f",
    position: { lat: 20, lon: 144 },
  },
  {
    id: "team",
    label: "Team",
    title: "Team",
    body: "デザイナー、エンジニア、ストラテジストが職種を超えて一つのチームで動きます。少数精鋭だからこそ生まれるスピードと密度があります。",
    accentColor: "#7ee081",
    position: { lat: -12, lon: 216 },
  },
  {
    id: "contact",
    label: "Contact",
    title: "Contact",
    body: "プロジェクトのご相談、お問い合わせはこちらから。まずはお気軽にお声がけください。",
    accentColor: "#c792ff",
    position: { lat: 10, lon: 288 },
  },
];
