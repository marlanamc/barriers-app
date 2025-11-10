"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { useCheckIn, type TaskAnchorType, type WeatherSelection } from "@/lib/checkin-context";
import { CheckinDatePicker } from "@/components/CheckinDatePicker";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import {
  getBarrierTypes,
  getTipsForBarrierTypes,
  saveCheckinWithFocus,
  type BarrierType,
  type BarrierTipMessage,
} from "@/lib/supabase";
import { anchorLabel, buildAnchorPhrase } from "@/lib/anchors";
import { getCategoryEmoji } from "@/lib/categories";

type ForecastTask = {
  id: string;
  description: string;
  anchorType: TaskAnchorType | null;
  anchorValue: string | null;
  emoji: string | null;
};

interface DailyForecastData {
  checkinId: string;
  weather: WeatherSelection;
  forecastNote: string;
  tasks: ForecastTask[];
  plannedDate: string;
}

const weatherThemes: Record<
  string,
  {
    gradient: [string, string];
    accent: string;
    text: string;
    subtleText: string;
  }
> = {
  clear: {
    gradient: ["#FFD580", "#FFF9E3"],
    accent: "text-amber-800",
    text: "text-slate-900",
    subtleText: "text-slate-700",
  },
  cloudy: {
    gradient: ["#CDE3F5", "#F2F2F2"],
    accent: "text-slate-700",
    text: "text-slate-900",
    subtleText: "text-slate-600",
  },
  rainy: {
    gradient: ["#9CBED7", "#D1E2EA"],
    accent: "text-slate-800",
    text: "text-slate-900",
    subtleText: "text-slate-700",
  },
  stormy: {
    gradient: ["#B38DCB", "#5D7AA2"],
    accent: "text-indigo-50",
    text: "text-white",
    subtleText: "text-indigo-100",
  },
  quiet: {
    gradient: ["#B6B6D8", "#E0D5F2"],
    accent: "text-slate-800",
    text: "text-slate-900",
    subtleText: "text-slate-700",
  },
};

type WallpaperThemeKey = "auto" | "sunset" | "forest" | "dusk";

const customWallpaperThemes: Record<
  Exclude<WallpaperThemeKey, "auto">,
  {
    name: string;
    gradient: [string, string];
    accent: string;
    text: string;
    subtleText: string;
  }
> = {
  sunset: {
    name: "Sunset Bloom",
    gradient: ["#f6d365", "#fda085"],
    accent: "text-amber-900",
    text: "text-slate-900",
    subtleText: "text-amber-900/70",
  },
  forest: {
    name: "Forest Calm",
    gradient: ["#0bab64", "#3bb78f"],
    accent: "text-emerald-100",
    text: "text-white",
    subtleText: "text-emerald-100/80",
  },
  dusk: {
    name: "Indigo Dusk",
    gradient: ["#4e54c8", "#8f94fb"],
    accent: "text-indigo-100",
    text: "text-white",
    subtleText: "text-indigo-100/80",
  },
};

const reminderBank = [
  "Gentle steps still count.",
  "Tiny moves can shift the whole day.",
  "Pause, sip water, soften your shoulders.",
  "Kind repetition beats perfect effort.",
  "You can move at the speed of kindness.",
];

function getWeatherTheme(key?: string | null) {
  return (
    weatherThemes[key ?? ""] ?? {
      gradient: ["#D6E8F5", "#FDFCFB"],
      accent: "text-slate-800",
      text: "text-slate-900",
      subtleText: "text-slate-700",
    }
  );
}

function resolveWallpaperTheme(weatherKey: string | null, theme: WallpaperThemeKey) {
  if (theme !== "auto") {
    return customWallpaperThemes[theme];
  }
  return getWeatherTheme(weatherKey);
}

const wallpaperThemeOptions: Array<{ key: WallpaperThemeKey; label: string }> = [
  { key: "auto", label: "Match weather" },
  { key: "sunset", label: "Sunset Bloom" },
  { key: "forest", label: "Forest Calm" },
  { key: "dusk", label: "Indigo Dusk" },
];

function pickReminder(seed: string) {
  const seedValue = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return reminderBank[seedValue % reminderBank.length];
}

export default function GentleSupportScreen() {
  const router = useRouter();
  const { weather, forecastNote, focusItems, resetCheckIn, checkinDate, setCheckinDate } = useCheckIn();
  const activeFocusItems = focusItems.filter((item) => !item.completed);
  const { user, loading: authLoading, error: authError } = useSupabaseUser();
  const forecastRef = useRef<HTMLDivElement>(null);
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [tipsBySlug, setTipsBySlug] = useState<Record<string, BarrierTipMessage>>({});
  const [loadingTips, setLoadingTips] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastData | null>(null);
  const [exportingImage, setExportingImage] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [wallpaperTheme, setWallpaperTheme] = useState<WallpaperThemeKey>("auto");

  useEffect(() => {
    if (done || dailyForecast) return;
    if (!weather) {
      router.replace("/");
    } else if (!activeFocusItems.length) {
      router.replace("/focus");
    }
  }, [activeFocusItems.length, dailyForecast, done, router, weather]);

  useEffect(() => {
    let mounted = true;

    async function loadTips() {
      setLoadingTips(true);
      const types = await getBarrierTypes();
      if (!mounted) return;
      setBarrierTypes(types);

      const slugSet = new Set(
        activeFocusItems
          .map((item) => item.barrier?.barrierTypeSlug)
          .filter(Boolean) as string[]
      );

      if (!slugSet.size) {
        setLoadingTips(false);
        return;
      }

      const relevantTypes = types.filter((type) => slugSet.has(type.slug));
      const tips = await getTipsForBarrierTypes(relevantTypes);
      if (!mounted) return;

      const map: Record<string, BarrierTipMessage> = {};
      tips.forEach((tip) => {
        map[tip.slug] = tip;
      });

      setTipsBySlug(map);
      setLoadingTips(false);
    }

    loadTips();

    return () => {
      mounted = false;
    };
  }, [activeFocusItems]);

  useEffect(() => {
    if (!exportMessage) return;
    const timer = window.setTimeout(() => setExportMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [exportMessage]);

  const barrierBySlug = useMemo(() => {
    return barrierTypes.reduce<Record<string, BarrierType>>((acc, type) => {
      acc[type.slug] = type;
      return acc;
    }, {});
  }, [barrierTypes]);

  if (!dailyForecast && (!weather || !activeFocusItems.length)) {
    return null;
  }

  const canSave = Boolean(user) && !saving && activeFocusItems.every((item) => {
    const barrier = item.barrier;
    const hasBarrier = Boolean(
      barrier && (barrier.barrierTypeSlug || barrier.custom?.trim())
    );
    const hasAnchor = Boolean(item.anchorType && item.anchorValue?.trim());
    return hasBarrier && hasAnchor;
  });

  async function captureForecastCanvas() {
    if (!forecastRef.current) return null;
    return html2canvas(forecastRef.current, {
      backgroundColor: null,
      scale: 2,
    });
  }

  function canvasToBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  async function handleSaveImage() {
    if (!dailyForecast) return;
    setExportingImage(true);
    try {
      const canvas = await captureForecastCanvas();
      if (!canvas) throw new Error("Unable to capture forecast.");
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `daily-forecast-${dailyForecast.checkinId.slice(0, 8)}.png`;
      link.click();
      setExportMessage("Saved to downloads.");
    } catch (error) {
      console.error(error);
      setExportMessage("Unable to save image.");
    } finally {
      setExportingImage(false);
    }
  }

  async function handleShareImage() {
    if (!dailyForecast) return;

    if (typeof navigator === "undefined") {
      await handleSaveImage();
      return;
    }

    const nav = navigator as Navigator & {
      share?: Navigator["share"];
      canShare?: (data?: ShareData) => boolean;
    };

    if (typeof nav.share !== "function") {
      await handleSaveImage();
      return;
    }

    setExportingImage(true);
    try {
      const canvas = await captureForecastCanvas();
      if (!canvas) throw new Error("Unable to capture forecast.");
      const blob = await canvasToBlob(canvas);
      if (!blob) throw new Error("Unable to build share image.");
      const fileName = `daily-forecast-${dailyForecast.checkinId.slice(0, 8)}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (typeof nav.canShare === "function" && !nav.canShare({ files: [file] })) {
        await handleSaveImage();
        return;
      }

      await nav.share({
        files: [file],
        title: "Daily Forecast",
        text: "Keeping today's focus gentle.",
      });
      setExportMessage("Shared!");
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error(error);
        setExportMessage("Share unavailable.");
      }
    } finally {
      setExportingImage(false);
    }
  }

  function handleDone() {
    router.push("/calendar");
  }

  async function handleSave() {
    if (!user || !canSave || !weather) return;
    setSaving(true);
    setSaveError(null);

    try {
      const snapshotTasks: ForecastTask[] = activeFocusItems.map((item) => ({
        id: item.id,
        description: item.description,
        anchorType: item.anchorType ?? null,
        anchorValue: item.anchorValue ?? null,
        emoji: getCategoryEmoji(item.categories[0]) || null,
      }));

      const checkinId = await saveCheckinWithFocus({
        userId: user.id,
        internalWeather: weather,
        forecastNote,
        focusItems: activeFocusItems.map((item) => ({
          id: item.id,
          description: item.description,
          categories: item.categories,
          sortOrder: item.sortOrder,
          plannedItemId: item.plannedItemId ?? null,
          anchorType: item.anchorType || null,
          anchorValue: item.anchorValue || null,
          barrier: item.barrier || null,
        })),
        checkinDate,
      });
      setDailyForecast({
        checkinId,
        weather,
        forecastNote: forecastNote || "",
        tasks: snapshotTasks,
        plannedDate: checkinDate,
      });
      setWallpaperTheme("auto");
      setDone(true);
      resetCheckIn();
    } catch (error: any) {
      console.error(error);
      setSaveError(error.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (done && dailyForecast) {
    const theme = resolveWallpaperTheme(dailyForecast.weather.key, wallpaperTheme);
    const reminder = pickReminder(`${dailyForecast.checkinId}${dailyForecast.weather.key}`);
    const weatherEmoji = dailyForecast.weather.icon;
    const weatherHeadline = `${dailyForecast.weather.label} energy`;
    const anchorHeadingClass =
      theme.text.includes("text-white") || theme.subtleText.includes("text-indigo")
        ? "text-white/80"
        : "text-slate-600";
    const anchorItemText = theme.text.includes("text-white") ? "text-white" : "text-slate-800";

    return (
      <main className="min-h-screen px-4 pb-16 pt-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <header className="flex items-center gap-4">
            <Link
              href="/calendar"
              className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-600">Daily Forecast</p>
              <h1 className="text-2xl font-bold text-slate-900">Your Daily Forecast</h1>
              <p className="text-sm text-slate-600">Keep today&rsquo;s weather + anchors close.</p>
            </div>
          </header>

          <section className="flex justify-center">
            <div className="w-full max-w-[420px]">
              <div
                ref={forecastRef}
                className="relative w-full overflow-hidden rounded-[48px] shadow-2xl"
                style={{
                  aspectRatio: "9 / 16",
                }}
              >
                <div
                  className="flex h-full flex-col justify-between p-8"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                  }}
                >
                  <div className="text-center">
                    <span className="text-7xl drop-shadow-sm">{weatherEmoji}</span>
                    <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.3em] ${theme.subtleText}`}>
                      today’s vibe
                    </p>
                    <h2 className={`mt-2 text-[2.5rem] font-bold leading-tight ${theme.text}`}>{weatherHeadline}</h2>
                    <p className={`text-base ${theme.subtleText}`}>{dailyForecast.weather.description}</p>
                    <p className={`mt-5 text-lg font-semibold leading-snug ${theme.text}`}>{reminder}</p>
                  </div>

                  <div className={`rounded-3xl bg-white/25 p-5 backdrop-blur ${anchorItemText}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${anchorHeadingClass}`}>
                      Today’s focus list
                    </p>
                    <ul className="mt-3 space-y-3 text-base font-semibold">
                      {dailyForecast.tasks.map((task) => (
                        <li key={task.id} className="flex items-start gap-2">
                          <span className="text-2xl leading-none">{task.emoji || "•"}</span>
                          <span>{buildAnchorPhrase(task.description, task.anchorType, task.anchorValue)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {dailyForecast.forecastNote && (
                    <div className={`mt-4 rounded-3xl bg-white/20 p-4 text-sm ${anchorItemText}`}>
                      {dailyForecast.forecastNote}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {exportMessage && (
            <p className="text-center text-sm text-slate-600">{exportMessage}</p>
          )}

          <section className="rounded-3xl border border-white/30 bg-white/90 p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">Wallpaper palette</p>
            <p className="text-xs text-slate-500">
              Try a different gradient before saving to match your phone vibe.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {wallpaperThemeOptions.map((option) => {
                const previewTheme =
                  option.key === "auto"
                    ? getWeatherTheme(dailyForecast.weather.key)
                    : customWallpaperThemes[option.key];
                const active = wallpaperTheme === option.key;
                return (
                  <button
                    type="button"
                    key={option.key}
                    onClick={() => setWallpaperTheme(option.key)}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-cyan-400 bg-cyan-50 text-cyan-800"
                        : "border-white/60 bg-white text-slate-600 hover:border-cyan-200"
                    }`}
                  >
                    <span
                      className="h-6 w-12 rounded-full"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${previewTheme.gradient[0]}, ${previewTheme.gradient[1]})`,
                      }}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={handleSaveImage}
              disabled={exportingImage}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/90 px-4 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportingImage && <Loader2 className="h-4 w-4 animate-spin" />}
              Save as image
            </button>
            <button
              type="button"
              onClick={handleShareImage}
              disabled={exportingImage}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/90 px-4 py-3 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportingImage && <Loader2 className="h-4 w-4 animate-spin" />}
              Share
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Done
            </button>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/barriers"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600">Step 4</p>
            <h1 className="text-2xl font-bold text-slate-900">Gentle support</h1>
            <p className="text-sm text-slate-600">Soft reminders matched to each barrier.</p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{weather?.icon}</div>
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Internal weather</p>
              <p className="text-xl font-semibold text-slate-900">{weather?.label}</p>
              <p className="text-sm text-slate-600">{weather?.description}</p>
            </div>
          </div>
          {forecastNote && (
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {forecastNote}
            </p>
          )}
          <CheckinDatePicker
            value={checkinDate}
            onChange={setCheckinDate}
            description="Set the date you want this plan to cover."
          />
        </section>

        <section className="space-y-4">
          {activeFocusItems.map((item) => {
            const slug = item.barrier?.barrierTypeSlug;
            const friendlyBarrier = slug ? barrierBySlug[slug] : null;
            const tip = slug ? tipsBySlug[slug] : null;
            const anchorSummary = anchorLabel(item.anchorType, item.anchorValue);
            const categoryEmoji = getCategoryEmoji(item.categories[0]);
            return (
              <div
                key={item.id}
                className="space-y-3 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-sm"
              >
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Focus</p>
                  <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    {categoryEmoji && <span className="text-2xl leading-none">{categoryEmoji}</span>}
                    <span>{item.description}</span>
                  </p>
                  {anchorSummary && (
                    <p className="text-sm text-cyan-700">{anchorSummary}</p>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-800">Barrier</p>
                  <p>
                    {friendlyBarrier?.icon && <span className="mr-1">{friendlyBarrier.icon}</span>}
                    {friendlyBarrier?.label || item.barrier?.custom || "Custom reflection"}
                  </p>
                  {item.barrier?.custom && (
                    <p className="mt-1 text-slate-500">{item.barrier.custom}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-dashed border-cyan-100 bg-white px-4 py-4 text-slate-700">
                  <div className="mb-2 flex items-center gap-2 text-cyan-600">
                    <Sparkles className="h-4 w-4" />
                    Gentle support
                  </div>
                  {loadingTips ? (
                    <p className="text-sm text-slate-500">Finding a tip...</p>
                  ) : (
                    <p className="text-sm leading-relaxed">
                      {tip?.message ||
                        "Offer yourself one small kindness. You can pause, breathe, and return when it feels lighter."}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {authError && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {authError}. Saving may require configuring Supabase credentials.
          </p>
        )}

        {saveError && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{saveError}</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {done ? "Saved" : "Save check-in"}
          {done && <Check className="h-5 w-5" />}
        </button>
      </div>
    </main>
  );
}
