import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { defaultSettings, type ApplicationResult } from "@shared/founders";
import LandingContent from "@/components/LandingContent";
import ApplicationWizard from "@/components/ApplicationWizard";
import ResultBrief from "@/components/ResultBrief";
import { ConsentBanner } from "@/components/BrandShell";

function readSaved() {
  try {
    const raw = sessionStorage.getItem("fitflix-brief-access");
    if (!raw) return null;
    const value = JSON.parse(raw);
    return typeof value.id === "string" && typeof value.token === "string"
      ? (value as { id: string; token: string })
      : null;
  } catch {
    return null;
  }
}
export default function Home() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ApplicationResult | null>(null);
  const [saved, setSaved] = useState(readSaved);
  const [resume, setResume] = useState(false);
  const embedded =
    new URLSearchParams(window.location.search).get("embed") === "1";
  const campaign = trpc.founders.settings.useQuery(undefined, {
    retry: 1,
    staleTime: 30000,
  });
  const settings = campaign.data || {
    ...defaultSettings,
    applicationOpen: !campaign.isError,
  };
  const previous = trpc.founders.lead.useMutation();
  useEffect(() => {
    if (resume && previous.data) {
      setResult(previous.data as ApplicationResult);
      setResume(false);
    }
  }, [previous.data, resume]);
  useEffect(() => {
    if (!embedded) return;
    const observer = new ResizeObserver(() => {
      window.parent.postMessage(
        {
          type: "fitflix:height",
          height: document.documentElement.scrollHeight,
        },
        "https://www.fitflix.in"
      );
      window.parent.postMessage(
        {
          type: "fitflix:height",
          height: document.documentElement.scrollHeight,
        },
        "https://fitflix.in"
      );
    });
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [embedded, result]);
  function complete(data: ApplicationResult) {
    setResult(data);
    setOpen(false);
    try {
      sessionStorage.setItem(
        "fitflix-brief-access",
        JSON.stringify({ id: data.id, token: data.token })
      );
      setSaved({ id: data.id, token: data.token });
    } catch {
      /* summary remains available this visit */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function apply() {
    if (campaign.isError) {
      alert(
        "Campaign availability could not be checked. Please retry or contact support@fitflix.in."
      );
      return;
    }
    if (
      !settings.applicationOpen ||
      settings.confirmedMembers === 100 ||
      (settings.deadline && Date.parse(settings.deadline) <= Date.now())
    ) {
      alert(
        "Founders Club applications are currently closed. Please contact support@fitflix.in for availability."
      );
      return;
    }
    setOpen(true);
  }
  return (
    <>
      {result ? (
        <ResultBrief
          result={result}
          settings={settings}
          onBack={() => {
            setResult(null);
            window.scrollTo(0, 0);
          }}
        />
      ) : (
        <>
          <LandingContent
            settings={settings}
            onApply={apply}
            embedded={embedded}
            availabilityVerified={campaign.isSuccess}
          />
          {saved && (
            <div className="resume-brief">
              <button
                onClick={() => {
                  if (saved) {
                    setResume(true);
                    previous.mutate(saved);
                  }
                }}
                disabled={previous.isPending}
              >
                {" "}
                {previous.isPending
                  ? "Opening your brief…"
                  : "Return to my personal brief"}{" "}
                <ArrowUpRight size={15} />
              </button>
              {previous.error && (
                <p role="alert">
                  Your saved brief could not be opened. Please reapply or
                  contact the team.
                </p>
              )}
            </div>
          )}
        </>
      )}
      <ApplicationWizard
        open={open}
        onClose={() => setOpen(false)}
        onComplete={complete}
      />
      <ConsentBanner pixelId={settings.metaPixelId} />
    </>
  );
}
