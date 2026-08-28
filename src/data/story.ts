/**
 * The full "how do we build proteins" script, transcribed from the Figma
 * layer export (Desktop - 2 / Frame 6). 36 dialogue beats, in order.
 *
 * Layout rules taken from the design:
 *  - Vera always stands on the left of a duo panel; the co-star on the right.
 *  - The speech bubble tail points at whoever is talking (`speaker`).
 *  - `solo` panels are the wide interstitials where Vera asks the next question
 *    on her own before a new character walks in.
 */

export type CastId =
  | "vera"
  | "plasmid"
  | "dh5a"
  | "bl21"
  | "iptg"
  | "lysis"
  | "protein";

export interface CastMember {
  id: CastId;
  name: string;
  src: string;
  /** Rendered height inside a duo panel, in design px. */
  height: number;
}

export const CAST: Record<CastId, CastMember> = {
  vera: { id: "vera", name: "Vera", src: "/assets/vera-main.png", height: 326 },
  plasmid: { id: "plasmid", name: "Plasmid", src: "/assets/plasmid.png", height: 235 },
  dh5a: { id: "dh5a", name: "DH5\u03B1", src: "/assets/dh5a.png", height: 274 },
  bl21: { id: "bl21", name: "BL21 (DE3)", src: "/assets/bl21.png", height: 247 },
  iptg: { id: "iptg", name: "IPTG", src: "/assets/iptg.png", height: 280 },
  lysis: { id: "lysis", name: "Lysis Buffer", src: "/assets/lysis.png", height: 288 },
  protein: { id: "protein", name: "Protein", src: "/assets/protein.png", height: 159 },
};

/** Vera's poses for the solo interstitial panels. */
export const VERA_POSES = {
  thinking: "/assets/vera-thinking.png",
  shocked: "/assets/vera-shocked.png",
  happy: "/assets/vera-happy.png",
} as const;

type Pose = keyof typeof VERA_POSES;

export type Beat =
  | {
      kind: "duo";
      /** The character sharing the panel with Vera. */
      costar: Exclude<CastId, "vera">;
      /** Who is talking — decides which way the bubble tail points. */
      speaker: CastId;
      line: string;
    }
  | {
      kind: "solo";
      pose: Pose;
      line: string;
    };

export const STORY: Beat[] = [
  // --- Act 1: the plasmid ---------------------------------------------------
  { kind: "duo", costar: "plasmid", speaker: "vera", line: "Okay, Plasmid\u2026 what exactly are you doing here?" },
  { kind: "duo", costar: "plasmid", speaker: "plasmid", line: "I carry the instructions for making the protein." },
  { kind: "duo", costar: "plasmid", speaker: "vera", line: "So you're basically carrying the gene?" },
  { kind: "duo", costar: "plasmid", speaker: "plasmid", line: "Exactly! These instructions are a piece of DNA called a gene." },
  { kind: "duo", costar: "plasmid", speaker: "vera", line: "And then?" },
  { kind: "duo", costar: "plasmid", speaker: "plasmid", line: "We insert this gene into a small, circular piece of DNA called a plasmid, that's me" },

  { kind: "solo", pose: "thinking", line: "Okay, Plasmid is ready. But how do we get plasmid inside the bacteria?" },

  // --- Act 2: DH5-alpha, the courier ---------------------------------------
  { kind: "duo", costar: "dh5a", speaker: "dh5a", line: "That's where I come in!" },
  { kind: "duo", costar: "dh5a", speaker: "vera", line: "Who are you?" },
  { kind: "duo", costar: "dh5a", speaker: "dh5a", line: "I'm a special strain of E. coli called DH5alpha. Perfect at taking in plasmids and keeping them stable." },
  { kind: "duo", costar: "dh5a", speaker: "vera", line: "So you're the one carrying the plasmid?" },
  { kind: "duo", costar: "dh5a", speaker: "dh5a", line: "Exactly!" },

  { kind: "solo", pose: "thinking", line: "DH5\u03B1 helped us with the plasmid. But who actually makes the protein?" },

  // --- Act 3: BL21, the factory --------------------------------------------
  { kind: "duo", costar: "bl21", speaker: "bl21", line: "Me! I'm another strain of E. coli called BL21." },
  { kind: "duo", costar: "bl21", speaker: "vera", line: "And you're the protein factory?" },
  { kind: "duo", costar: "bl21", speaker: "bl21", line: "Exactly! I have everything I need to produce proteins in large amounts." },

  { kind: "solo", pose: "thinking", line: "BL21 is ready. But how do we tell it to start making the protein?" },

  // --- Act 4: IPTG, the switch ---------------------------------------------
  { kind: "duo", costar: "iptg", speaker: "iptg", line: "That's my job! I'm IPTG." },
  { kind: "duo", costar: "iptg", speaker: "vera", line: "And what do you do?" },
  { kind: "duo", costar: "iptg", speaker: "iptg", line: "I act as a 'start' button, turning on the protein-making machinery inside the bacteria." },
  { kind: "duo", costar: "iptg", speaker: "vera", line: "So you're basically the ON switch?" },
  { kind: "duo", costar: "iptg", speaker: "iptg", line: "Exactly! START!" },

  { kind: "solo", pose: "shocked", line: "Whoa, BL21 is completely full of our protein! How do we get it out?" },

  // --- Act 5: lysis buffer, the crowbar ------------------------------------
  { kind: "duo", costar: "lysis", speaker: "lysis", line: "Allow me. I am Lysis Buffer. I am a strong mix of soaps and salts." },
  { kind: "duo", costar: "lysis", speaker: "vera", line: "What are you going to do?" },
  { kind: "duo", costar: "lysis", speaker: "lysis", line: "I break open the bacteria. BL21 did a great job, but it is time to pop the cell open." },
  { kind: "duo", costar: "lysis", speaker: "vera", line: "Is it going to be messy?" },
  { kind: "duo", costar: "lysis", speaker: "lysis", line: "Very. \uD83D\uDCA5 POP!" },

  { kind: "solo", pose: "happy", line: "We did it! There's the protein!" },

  // --- Act 6: the protein, not yet pure ------------------------------------
  { kind: "duo", costar: "protein", speaker: "protein", line: "Wait, Vera!" },
  { kind: "duo", costar: "protein", speaker: "vera", line: "What's wrong? You are out of the cell!" },
  { kind: "duo", costar: "protein", speaker: "protein", line: "Look around! Lysis mixed me up with thousands of other bacterial parts." },
  { kind: "duo", costar: "protein", speaker: "vera", line: "Oh... so you are not pure yet?" },
  { kind: "duo", costar: "protein", speaker: "protein", line: "Nope. You need to use a tool called chromatography to wash the junk away and catch only me." },
  { kind: "duo", costar: "protein", speaker: "vera", line: "And then we are done?" },
  { kind: "duo", costar: "protein", speaker: "protein", line: "Then I am all yours!" },
];
