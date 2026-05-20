export interface EvidenceItem {
  kicker: string;
  detail: string;
  refs?: string[]; // shipment / hub / route IDs
}

export interface AssistantAnswer {
  promptId: string;
  question: string;
  shortKicker: string;
  headline: string; // serif
  evidence: EvidenceItem[];
  recommendations: string[];
  followUpHint?: string;
}

export const SUGGESTED_PROMPTS: AssistantAnswer[] = [
  {
    promptId: "sla-failures",
    question: "What could cause SLA failures tonight?",
    shortKicker: "Tonight's Breach Drivers",
    headline:
      "Three threads are pushing tonight's breach probability above 0.7.",
    evidence: [
      {
        kicker: "Weather",
        detail:
          "Heavy snow advisory on E4 between Gävle and Sundsvall. Twelve routes traverse this corridor; four are high-confidence breach candidates.",
        refs: ["RT-0142", "RT-0287", "RT-0301", "RT-0344"],
      },
      {
        kicker: "Hub Backlog",
        detail:
          "Stockholm sortation +18 packages over plan since 22:10 CET. Seven outbound cut-offs are at risk if the line-haul slot isn't held.",
        refs: ["SE-H01", "RT-0118", "RT-0119"],
      },
      {
        kicker: "Driver Availability",
        detail:
          "Tampere backup pool at 60% capacity. Two scheduled co-driver swaps at 04:00 are viable but tight; one shipment for Siemens Healthineers depends on the swap.",
        refs: ["FI-H01", "SH-100412"],
      },
    ],
    recommendations: [
      "Promote four Sweden-bound MRI shipments to the Tampere PUDO chain",
      "Hold Stockholm cut-off until 00:45 (recommend +15 minutes)",
      "Reassign route RT-0287 to standby driver Lars E.",
    ],
    followUpHint: "Apply the recommendations or ask about a specific customer.",
  },
  {
    promptId: "hub-backlog",
    question: "Which hub has the highest backlog right now?",
    shortKicker: "Backlog Snapshot",
    headline:
      "Stockholm Hub leads the network — eighteen packages above its sortation plan.",
    evidence: [
      {
        kicker: "Stockholm SE-H01",
        detail:
          "+18 packages, 22:10 onwards. Pick rate −9% vs. tonight's forecast. Conveyor lane B running slow since 21:48.",
        refs: ["SE-H01"],
      },
      {
        kicker: "Warsaw PL-H01",
        detail: "+9 packages, contained — cut-off projection unchanged.",
        refs: ["PL-H01"],
      },
      {
        kicker: "Riga LV-H01",
        detail: "Sortation cut-off slipped 22 minutes; recovery plan in flight.",
        refs: ["LV-H01"],
      },
    ],
    recommendations: [
      "Reassign two pickers from Stockholm's low-priority lane to lane B",
      "Move tonight's Stockholm cut-off to 00:45",
      "Flag Riga slip to ops manager — second night this week",
    ],
  },
  {
    promptId: "reposition-parts",
    question: "Where should we reposition automotive parts before tomorrow?",
    shortKicker: "Pre-Positioning Plan",
    headline:
      "Three Swedish FSLs and one Norwegian site should receive overnight moves.",
    evidence: [
      {
        kicker: "Gothenburg FSL",
        detail:
          "Brake actuator (Volvo Trucks) projected zero-stock in 34 hours. Recommend +24 units from Oslo Hub on the 23:40 line-haul slot.",
        refs: ["SE-F02"],
      },
      {
        kicker: "Malmö FSL",
        detail:
          "Air compressor cartridge below reorder. +12 units from Copenhagen Hub, low cost, low SLA risk.",
        refs: ["SE-F03"],
      },
      {
        kicker: "Stavanger FSL",
        detail:
          "Tyre stock low on studded winter 205/55 — seasonal demand spike forecast tomorrow morning.",
        refs: ["NO-F03"],
      },
    ],
    recommendations: [
      "Authorise three transfers — total move cost €1,240, exposure avoided €52k",
      "Add Stavanger to tomorrow's morning replenishment briefing",
    ],
  },
  {
    promptId: "customer-exceptions",
    question: "Which customer had the most SLA exceptions this week?",
    shortKicker: "Customer Performance",
    headline:
      "John Deere Nordic — fourteen exceptions, twice the tier-1 average.",
    evidence: [
      {
        kicker: "John Deere Nordic",
        detail:
          "14 exceptions over 7 days. Pattern: rural drop-points Mon–Wed evening. Failed-delivery cost €2,840.",
        refs: ["C-003"],
      },
      {
        kicker: "ABB Robotics",
        detail:
          "9 exceptions, all categorised as hub-backlog upstream of Stockholm.",
        refs: ["C-005"],
      },
      {
        kicker: "Wärtsilä",
        detail: "5 exceptions, well within tier-1 tolerance.",
        refs: ["C-008"],
      },
    ],
    recommendations: [
      "Schedule a John Deere review for Friday — bring rural-route mitigation proposal",
      "Propose ABB participate in the Stockholm pick-rate fix",
    ],
  },
];

export const DEMO_FALLBACK: AssistantAnswer = {
  promptId: "demo-fallback",
  question: "", // populated from user input at runtime
  shortKicker: "Demo Mode",
  headline:
    "I can answer about tonight's plan — try one of the curated questions on the right.",
  evidence: [
    {
      kicker: "What I See Tonight",
      detail:
        "1,847 shipments in flight across the seven-country network. Twelve are flagged for breach intervention. Three FSLs are on watch for predicted shortages.",
    },
    {
      kicker: "What I Can Answer In This Demo",
      detail:
        "Tonight's breach drivers, hub backlogs, replenishment plans, customer exception trends, and route cost outliers — pick a question on the right or paraphrase one of those topics.",
    },
  ],
  recommendations: [
    "Try \"What could cause SLA failures tonight?\" for the breach analysis",
    "Try \"Where should we reposition automotive parts before tomorrow?\" for the replenishment plan",
  ],
};

/** Match user-typed input to a canned answer, or fall back. */
export function routeFreeFormQuery(input: string): AssistantAnswer {
  const q = input.toLowerCase();

  // Topic keyword matching — covers the major demo prompts loosely
  if (
    q.includes("sla") ||
    q.includes("breach") ||
    q.includes("late") ||
    q.includes("fail")
  ) {
    return SUGGESTED_PROMPTS.find((p) => p.promptId === "sla-failures") ?? DEMO_FALLBACK;
  }
  if (q.includes("hub") || q.includes("backlog") || q.includes("sort")) {
    return SUGGESTED_PROMPTS.find((p) => p.promptId === "hub-backlog") ?? DEMO_FALLBACK;
  }
  if (
    q.includes("repos") ||
    q.includes("stock") ||
    q.includes("inventory") ||
    q.includes("reposition") ||
    q.includes("auto") ||
    q.includes("part") ||
    q.includes("fsl")
  ) {
    return SUGGESTED_PROMPTS.find((p) => p.promptId === "reposition-parts") ?? DEMO_FALLBACK;
  }
  if (
    q.includes("customer") ||
    q.includes("exception") ||
    q.includes("escalation")
  ) {
    return SUGGESTED_PROMPTS.find((p) => p.promptId === "customer-exceptions") ?? DEMO_FALLBACK;
  }
  if (q.includes("siemens") || q.includes("exposure") || q.includes("mri")) {
    return FOLLOWUP;
  }
  return { ...DEMO_FALLBACK, question: input };
}

export const FOLLOWUP: AssistantAnswer = {
  promptId: "followup-siemens",
  question: "And just for Siemens — what's the exposure?",
  shortKicker: "Siemens Healthineers Focus",
  headline:
    "One shipment is exposed; the recommended PUDO swap holds the contract.",
  evidence: [
    {
      kicker: "Shipment SH-100412",
      detail:
        "MRI gradient controller board · Helsinki → Tampere FSL. Pre-07:00 window. Breach probability 87% on current plan; 18% after Tampere PUDO Locker #14 swap.",
      refs: ["SH-100412"],
    },
    {
      kicker: "Downtime exposure",
      detail:
        "Life-sciences downtime cost €48k/hr. A 4-hour exposure would be €192k against this single SLA.",
    },
    {
      kicker: "Contract context",
      detail:
        "Siemens YTD SLA 96.8% — a single high-visibility breach would push them below the 96% renewal threshold.",
      refs: ["C-001"],
    },
  ],
  recommendations: [
    "Authorise PUDO swap for SH-100412 (see Screen 02)",
    "Add this incident summary to Friday's customer report (Screen 06)",
  ],
};
