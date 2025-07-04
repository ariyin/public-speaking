import { useRef, useCallback } from "react";
import VideoPlayer from "./VideoPlayer";
import type { CloudinaryPlayer } from "../utils/cloudinaryService";
import type { DeliveryAnalysis } from "../utils/deliveryAnalysis";
import type { ContentAnalysis } from "../utils/contentAnalysis";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface AnalysisContentProps {
  url: string;
  content: string | null;
  deliveryData: DeliveryAnalysis | null;
  contentData: ContentAnalysis | null;
}

export default function AnalysisContent({
  url,
  content,
  deliveryData,
  contentData,
}: AnalysisContentProps) {
  const playerRef = useRef<CloudinaryPlayer | null>(null);

  const handleTimestampClick = (timestamp: string) => {
    if (!playerRef.current) return;
    try {
      const [minutes, seconds] = timestamp.split(":").map(Number);
      const totalSeconds = minutes * 60 + seconds;
      // seek to the timestamp
      playerRef.current.currentTime(totalSeconds);
      playerRef.current.play();
    } catch (error) {
      console.error("Failure skipping to timestamp:", error);
    }
  };

  const handleReady = useCallback((player: CloudinaryPlayer) => {
    playerRef.current = player;
  }, []);

  return (
    <div className="grid h-full grid-cols-2 gap-10">
      <div className="flex flex-col items-center">
        <VideoPlayer url={url} onReady={handleReady} />
        {content && (
          <div className="relative mt-5 h-full w-full overflow-y-auto rounded-xl border-2 border-black">
            <div className="absolute inset-0">
              <p className="p-5 whitespace-pre-wrap">{content}</p>
            </div>
          </div>
        )}
      </div>
      <div className="relative h-full">
        <div className="absolute inset-0 space-y-4 overflow-auto">
          {!deliveryData && !contentData ? (
            <h3>no analysis available</h3>
          ) : (
            <>
              {deliveryData && (
                <>
                  <h2>delivery analysis</h2>
                  <h3>filler words</h3>
                  <div className="flex flex-wrap gap-3">
                    {deliveryData.filler_words &&
                    Object.keys(deliveryData.filler_words).length > 0 ? (
                      Object.entries(deliveryData.filler_words).map(
                        ([word, count], idx) => (
                          <div key={idx} className="tag">
                            {word} ({count})
                          </div>
                        ),
                      )
                    ) : (
                      <p>none found</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <h3>speaking rate</h3>
                    <Tooltip>
                      <TooltipTrigger className="hover:text-cherry border-0 p-0 text-gray-400 hover:bg-transparent">
                        <Info />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          A good rate of speech ranges between 140 -160 words
                          per minute
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p>
                    {deliveryData.speech_rate_wpm ?? "N/A"} words per minute
                  </p>
                  <h3>body language</h3>
                  <Accordion type="multiple">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>pros</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-3">
                        {deliveryData.body_language_analysis.pros.length > 0 ? (
                          deliveryData.body_language_analysis.pros.map(
                            ({ timestamp, description }, idx) => (
                              <div key={idx} className="font-gs">
                                {timestamp.split(",").map((t, i, arr) => (
                                  <button
                                    key={i}
                                    onClick={() =>
                                      handleTimestampClick(t.trim())
                                    }
                                    className={`timestamp ${
                                      arr.length > 1 && i < arr.length - 1
                                        ? "mr-2"
                                        : ""
                                    }`}
                                    type="button"
                                  >
                                    <strong>{t.trim()}</strong>
                                  </button>
                                ))}
                                : {description}
                              </div>
                            ),
                          )
                        ) : (
                          <p>no pros found</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>areas of improvement</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-3">
                        {deliveryData.body_language_analysis.cons.length > 0 ? (
                          deliveryData.body_language_analysis.cons.map(
                            ({ timestamp, description }, idx) => (
                              <div key={idx} className="font-gs">
                                {timestamp.split(",").map((t, i, arr) => (
                                  <button
                                    key={i}
                                    onClick={() =>
                                      handleTimestampClick(t.trim())
                                    }
                                    className={`timestamp ${
                                      arr.length > 1 && i < arr.length - 1
                                        ? "mr-2"
                                        : ""
                                    }`}
                                    type="button"
                                  >
                                    <strong>{t.trim()}</strong>
                                  </button>
                                ))}
                                : {description}
                              </div>
                            ),
                          )
                        ) : (
                          <p>no areas of improvement found, you did perfect!</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </>
              )}

              {contentData && (
                <>
                  <h2>content analysis</h2>
                  {/* Outline Analysis (Pros & Cons) */}
                  {contentData.content_analysis && (
                    <>
                      <h3>outline feedback</h3>
                      <Accordion type="multiple">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>pros</AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-3">
                            {contentData.content_analysis.pros.length > 0 ? (
                              contentData.content_analysis.pros.map(
                                (obs, idx) => (
                                  <div key={idx} className="font-gs">
                                    <button
                                      onClick={() =>
                                        handleTimestampClick(
                                          obs.timestamp
                                            .trim()
                                            .replace(/\./g, ":"),
                                        )
                                      }
                                      className="timestamp mb-3"
                                      type="button"
                                    >
                                      <strong>
                                        {obs.timestamp
                                          .trim()
                                          .replace(/\./g, ":")}
                                      </strong>
                                    </button>
                                    : {obs.outline_point}
                                    <div className="flex flex-col gap-2">
                                      <p className="font-medium">
                                        {obs.transcript_excerpt}
                                      </p>
                                      <p>{obs.suggestion}</p>
                                    </div>
                                  </div>
                                ),
                              )
                            ) : (
                              <p>no strengths found in outline.</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>
                            areas of improvement
                          </AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-3">
                            {contentData.content_analysis.cons.length > 0 ? (
                              contentData.content_analysis.cons.map(
                                (obs, idx) => (
                                  <div key={idx} className="font-gs">
                                    <button
                                      onClick={() =>
                                        handleTimestampClick(
                                          obs.timestamp
                                            .trim()
                                            .replace(/\./g, ":"),
                                        )
                                      }
                                      className="timestamp mb-3"
                                      type="button"
                                    >
                                      <strong>
                                        {obs.timestamp
                                          .trim()
                                          .replace(/\./g, ":")}
                                      </strong>
                                    </button>
                                    : {obs.outline_point}
                                    <div className="flex flex-col gap-2">
                                      <p className="font-medium">{obs.issue}</p>
                                      <p>{obs.suggestion}</p>
                                    </div>
                                  </div>
                                ),
                              )
                            ) : (
                              <p>no weaknesses found in outline — great job!</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </>
                  )}

                  {/* Script Analysis (Omissions, Additions, Paraphrases) */}
                  {contentData.script_analysis && (
                    <>
                      <h3>script feedback</h3>
                      <Accordion type="multiple">
                        {(() => {
                          const scriptAnalysis = contentData.script_analysis;
                          if (!scriptAnalysis) return null;

                          const scriptTypes = [
                            "omissions",
                            "additions",
                            "paraphrases",
                          ] as const;
                          type ScriptType = (typeof scriptTypes)[number];

                          return scriptTypes.map((key: ScriptType) => (
                            <AccordionItem key={key} value={`item-${key}`}>
                              <AccordionTrigger>{key}</AccordionTrigger>
                              <AccordionContent className="flex flex-col gap-3">
                                {scriptAnalysis[key].length > 0 ? (
                                  scriptAnalysis[key].map(
                                    (obs: any, idx: number) => (
                                      <div key={idx} className="font-gs">
                                        <button
                                          onClick={() =>
                                            handleTimestampClick(
                                              obs.timestamp
                                                .trim()
                                                .replace(/\./g, ":"),
                                            )
                                          }
                                          className="timestamp mb-3"
                                          type="button"
                                        >
                                          <strong>
                                            {obs.timestamp
                                              .trim()
                                              .replace(/\./g, ":")}
                                          </strong>
                                        </button>
                                        <div className="flex flex-col gap-2">
                                          <p>
                                            <span className="font-medium">
                                              script
                                            </span>
                                            : {obs.script_excerpt}
                                          </p>
                                          <p>
                                            <span className="font-medium">
                                              transcript
                                            </span>
                                            : {obs.transcript_excerpt}
                                          </p>
                                          <p>
                                            <span className="font-medium">
                                              note
                                            </span>
                                            : {obs.note}
                                          </p>
                                        </div>
                                      </div>
                                    ),
                                  )
                                ) : (
                                  <p>no {key} found</p>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ));
                        })()}
                      </Accordion>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
