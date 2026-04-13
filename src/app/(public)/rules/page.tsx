import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const RULES_SECTIONS = [
  {
    title: "General Play",
    rules: [
      {
        name: "Eligible Course",
        text: "All league rounds shall be played exclusively at The Meadows Golf & Country Club.",
      },
      {
        name: "Eligible Tees",
        text: "All league rounds shall be played from either the White or Blue tee boxes. Players must declare their tee selection prior to the commencement of play.",
      },
      {
        name: "Round Declaration",
        text: "Players must declare before the start of a round whether they are counting nine or eighteen holes. A round may not be retroactively shortened or excluded once play has commenced, unless an extraordinary circumstance forces a player to leave the course.",
      },
      {
        name: "Conceded Putts",
        text: "A putt may be conceded by a majority of the playing group (more than half in favour). The ball must lie within one putter shaft length of the hole to be eligible for concession. Conceded putts are not permitted during tournament rounds (e.g., M.Q. Invitational, O.S. Classic).",
      },
    ],
  },
  {
    title: "Relief & Drops",
    rules: [
      {
        name: "Out of Bounds (White Stakes)",
        text: "White stakes denote out of bounds. The player shall take a drop at the estimated point where the ball crossed the boundary, with a one-stroke penalty.",
      },
      {
        name: "Lost Ball",
        text: "If a ball cannot be found within three (3) minutes of search, the player shall take a drop at the estimated point of loss, with a one-stroke penalty.",
      },
      {
        name: "Red Penalty Areas",
        text: "A ball lying within a red-staked penalty area may be played as it lies without penalty. Alternatively, the player may elect to take relief under standard penalty area procedures with a one-stroke penalty.",
      },
      {
        name: "Obstruction Relief (Trees)",
        text: "If a player\u2019s stance behind a tree would risk damage to their club on a punch-out shot, the player is entitled to a free drop behind the obstruction \u2014 provided the drop is no closer to the hole and the resulting lie permits only a punch-out, not a full swing.",
      },
      {
        name: "Embedded Ball in Fairway Divot",
        text: "If a ball comes to rest in a divot on the fairway, the player may lift and place the ball within one foot, no closer to the hole, without penalty.",
      },
      {
        name: "Casual Water",
        text: "If water visibly rises around a player\u2019s feet when taking their stance, the player is entitled to free relief. The ball shall be dropped at the nearest point of complete relief, no closer to the hole.",
      },
      {
        name: "General Drop Disputes",
        text: "When the point of exit or loss is disputed, the playing group shall reach consensus on the appropriate drop location.",
      },
    ],
  },
  {
    title: "Scoring & Rankings",
    rules: [
      {
        name: "Maximum Score",
        text: "The maximum score on any hole is double par plus one (e.g., 7 on a par 3, 9 on a par 4, 11 on a par 5). Upon reaching the maximum, the player shall pick up and record that score. This rule does not apply during tournament rounds (e.g., M.Q. Invitational, O.S. Classic), where actual scores must be recorded on every hole.",
      },
      {
        name: "Handicap Index",
        text: "Handicap differentials are calculated using the formula: (Score \u2212 Course Rating) \u00d7 113 \u00f7 Slope Rating. The differential is computed at the time of score entry and is based on the tee played.",
      },
      {
        name: "Match Results",
        text: "Win, Loss, and Tie results are determined per round date \u2014 the lowest score among all players competing on a given date and course is awarded the win. Tied low scores result in a tie for all players involved.",
      },
      {
        name: "Tournament Tie-Break",
        text: "If two or more players are tied at the conclusion of a tournament, the tie shall be broken by a putting competition held at the North/West putting green. Each player putts once toward a designated target, in rotation, without being able to observe the other players\u2019 putts. The player whose ball finishes closest to the target wins. The process only repeats if both players sink the putt.",
      },
      {
        name: "League Ranking",
        text: "Players must complete a minimum of ten (10) league rounds to receive an official numerical ranking. Players with fewer than ten rounds will appear on the leaderboard but remain unranked.",
      },
    ],
  },
  {
    title: "Governance",
    rules: [
      {
        name: "Annual General Meeting",
        text: "League rules are reviewed, debated, and ratified annually at the Annual General Meeting (AGM). Only full members hold voting rights at the AGM.",
      },
      {
        name: "Social Membership",
        text: "Full membership requires a $10 annual fee. Social members participate under the same on-course rules and scoring system as full members and are eligible to compete in and win all tournaments and events. Social members do not hold voting rights at the AGM.",
      },
      {
        name: "Commissioner Authority",
        text: "The Commissioner reserves the right to issue rulings on disputes and to amend rules mid-season when necessary, with notification to all league members.",
      },
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-16">
      <h1
        className="text-center text-4xl font-bold text-primary"
        style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
      >
        Our Rules
      </h1>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      {/* Intro */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-base leading-relaxed text-muted-foreground">
          Over the years, the rules of the Ottawa Super League have evolved through debate and consensus.
          New rules and proposed changes are decided upon at the Annual General Meeting (AGM), where full
          members vote on amendments for the coming season. Below are the most up-to-date rules.
        </p>

      </div>

      {/* Rule Sections */}
      <div className="mx-auto mt-8 max-w-3xl space-y-6">
        {RULES_SECTIONS.map((section, sectionIdx) => (
          <Card key={section.title} className="py-4">
            <CardHeader className="pb-0">
              <CardTitle>
                <h2
                  className="text-2xl font-bold text-foreground"
                  style={{
                    fontFamily: "var(--font-dancing-script)",
                    WebkitTextStroke: "0.6px currentColor",
                  }}
                >
                  {section.title}
                </h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-none space-y-3 pl-0 text-sm leading-relaxed">
                {section.rules.map((rule, ruleIdx) => (
                  <li key={rule.name} className="flex gap-2">
                    <span className="shrink-0 font-semibold text-sm tabular-nums">{sectionIdx + 1}.{ruleIdx + 1}</span>
                    <span><strong>{rule.name}.</strong> {rule.text}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mx-auto mt-8 max-w-3xl rounded-lg border bg-muted/40 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> These rules are subject to amendment at the Annual General Meeting or by
          Commissioner ruling. All members will be notified of any mid-season changes.
        </p>
      </div>
    </div>
  );
}
