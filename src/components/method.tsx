import { engagementPath, methodIntro } from '@/content/method';
import type { Pillar } from '@/lib/cms-schema';
import { typo } from '@/lib/typo';

export function Method({ pillars }: { pillars: readonly Pillar[] }) {
  return (
    <section id="how-we-work" aria-labelledby="method-title" className="section">
      <div className="wrap">
        <div className="method-layout">
          <div className="method-intro">
            <h2 id="method-title" className="display-2">
              {methodIntro.heading}
            </h2>
            <p className="lede mt-6 max-w-[30rem]">{methodIntro.contrast}</p>
            <p className="soft mt-6 max-w-[30rem]">{methodIntro.where}</p>
          </div>

          <div>
            {pillars.map((pillar) => (
              <article key={pillar.id} className="pillar">
                <h3 className="display-3">{pillar.title}</h3>
                <p className="mt-4 max-w-[34rem]">{pillar.body}</p>
                {pillar.sampleQuestion ? (
                  <p className="soft mt-4 max-w-[34rem] text-[1rem]">
                    A question you might hear: <em className="font-display-italic not-italic">{pillar.sampleQuestion}</em>
                  </p>
                ) : null}
                {pillar.proofQuote ? (
                  <blockquote className="pillar-proof">
                    <p>“{typo(pillar.proofQuote)}”</p>
                    {pillar.proofBy ? <footer>{pillar.proofBy}</footer> : null}
                  </blockquote>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h3 className="display-3">What it looks like in practice</h3>
          <ol className="path-list mt-8">
            {engagementPath.map((step, index) => (
              <li key={step.title}>
                <span className="path-num">{index + 1}</span>
                <div>
                  <h4 className="font-display text-[1.5rem] leading-tight">{step.title}</h4>
                  <p className="mt-2 max-w-[24rem]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="soft mt-8 max-w-[38rem]">{methodIntro.investment}</p>
        </div>
      </div>
    </section>
  );
}
