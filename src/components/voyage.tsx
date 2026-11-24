import { chapters, voyageIntro } from '@/content/voyage';
import { WORLD_MAP as map } from '@/content/world-map.generated';
import { VoyageController } from '@/components/voyage-controller';

type StopId = keyof typeof map.stops;

/**
 * "The Voyage": a sticky map whose route draws as the chapters scroll past.
 * All markup is server-rendered. Without JavaScript (or with reduced motion) the whole route is drawn and every
 * chapter is fully visible; <VoyageController> only adds the scroll-linked state.
 */
export function Voyage() {
  const first = map.stops[chapters[0].id as StopId];

  return (
    <>
      <section id="voyage" aria-labelledby="voyage-title" className="voyage on-dark">
        <div className="wrap">
          <div className="pt-[clamp(4.5rem,9vw,8rem)] pb-10">
            <h2 id="voyage-title" className="display-2">
              {voyageIntro.title}
            </h2>
            <p className="lede soft mt-5 max-w-[34rem]">{voyageIntro.lede}</p>
            <a href="#after-voyage" className="link-quiet mt-6 inline-block">
              {voyageIntro.skip}
            </a>
          </div>

          <div className="voyage-layout">
            <figure className="voyage-map" aria-hidden="true">
              <div className="voyage-map__frame">
                <svg viewBox={`0 0 ${map.width} ${map.height}`} focusable="false">
                  <path className="voyage-land" d={map.land} />
                  <path className="voyage-grat" d={map.graticule} />
                  <path className="voyage-lane" d={map.lane} data-lane data-lane-at="2" />
                  <circle cx={map.laneEnd.x} cy={map.laneEnd.y} r="3" fill="none" stroke="#a9cfc9" strokeWidth="1.5" opacity="0.7" />
                  {map.legs.map((d, i) => (
                    <path key={i} className="voyage-leg" d={d} pathLength={1} data-leg />
                  ))}
                  {chapters.map((chapter, i) => {
                    const point = map.stops[chapter.id as StopId];
                    return (
                      <circle
                        key={chapter.id}
                        className={`voyage-dot${i === 0 ? ' is-lit' : ''}`}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        data-dot
                      />
                    );
                  })}
                  <g
                    className="voyage-cursor"
                    data-cursor
                    style={{ transform: `translate(${first.x}px, ${first.y}px)` }}
                  >
                    <circle className="voyage-ring" r="10" />
                    <circle className="voyage-pulse" r="10" />
                  </g>
                </svg>
              </div>
              <figcaption className="voyage-readout mono-note">
                <span data-readout-place>{chapters[0].place}</span>
                <span data-readout-coords>{chapters[0].coords}</span>
              </figcaption>
            </figure>

            <ol className="voyage-chapters">
              {chapters.map((chapter, i) => {
                const point = map.stops[chapter.id as StopId];
                return (
                  <li
                    key={chapter.id}
                    className={`voyage-chapter${i === 0 ? ' is-active' : ''}`}
                    data-chapter
                    data-place={chapter.place}
                    data-coords={chapter.year ? `${chapter.coords}  ${chapter.year}` : chapter.coords}
                    data-x={point.x}
                    data-y={point.y}
                  >
                    <p className="mono-note text-brass m-0! flex gap-4">
                      <span>{chapter.coords}</span>
                      {chapter.year ? <span>{chapter.year}</span> : null}
                    </p>
                    <h3 className="display-3 mt-3">{chapter.title}</h3>
                    <p className="voyage-place">{chapter.place}</p>
                    {chapter.body.map((paragraph) => (
                      <p key={paragraph} className="voyage-body">{paragraph}</p>
                    ))}
                    <p className="voyage-sowhat">{chapter.soWhat}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <VoyageController />
      </section>
      <div id="after-voyage" />
    </>
  );
}
