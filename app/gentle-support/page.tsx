"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CalendarDays, CalendarPlus, Check, LineChart, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { useCheckIn, type TaskAnchorType, type WeatherSelection } from "@/lib/checkin-context";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getBarrierTypes, saveCheckinWithFocus, type BarrierType } from "@/lib/supabase";
import { anchorLabel, buildAnchorPhrase } from "@/lib/anchors";
import { getCategoryEmoji } from "@/lib/categories";
import { hasBarrierSelection } from "@/lib/barrier-helpers";

type ForecastTask = {
  id: string;
  description: string;
  anchorType: TaskAnchorType | null;
  anchorValue: string | null;
  emoji: string | null;
  barrierSlug: string | null;
  barrierLabel: string | null;
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
    darkGradient?: [string, string]; // Optional darker gradient for dark mode
    accent: string;
    darkAccent?: string; // Accent color for dark mode
    text: string;
    darkText?: string; // Text color for dark mode
    subtleText: string;
    darkSubtleText?: string; // Subtle text color for dark mode
  }
> = {
  sparky: {
    gradient: ["#FF6B6B", "#FFE66D"],
    darkGradient: ["#CC5555", "#CCB855"], // Darker, more muted for dark mode
    accent: "text-orange-900",
    darkAccent: "text-orange-200",
    text: "text-slate-900",
    darkText: "text-white",
    subtleText: "text-slate-700",
    darkSubtleText: "text-slate-100",
  },
  steady: {
    gradient: ["#FFD580", "#FFF9E3"],
    darkGradient: ["#CCAA66", "#CCCCB3"], // Darker, more muted for dark mode
    accent: "text-amber-800",
    darkAccent: "text-amber-300",
    text: "text-slate-900",
    darkText: "text-slate-900", // Still readable on lighter gradient
    subtleText: "text-slate-700",
    darkSubtleText: "text-slate-700",
  },
  flowing: {
    gradient: ["#4ECDC4", "#95E1D3"],
    darkGradient: ["#3E9C94", "#75B1A3"], // Darker, more muted for dark mode
    accent: "text-teal-900",
    darkAccent: "text-teal-200",
    text: "text-slate-900",
    darkText: "text-white",
    subtleText: "text-slate-700",
    darkSubtleText: "text-slate-100",
  },
  foggy: {
    gradient: ["#9CBED7", "#D1E2EA"],
    darkGradient: ["#7C9EB7", "#B1C2DA"], // Darker, more muted for dark mode
    accent: "text-slate-800",
    darkAccent: "text-slate-200",
    text: "text-slate-900",
    darkText: "text-white",
    subtleText: "text-slate-700",
    darkSubtleText: "text-slate-100",
  },
  resting: {
    gradient: ["#B6B6D8", "#E0D5F2"],
    darkGradient: ["#9696B8", "#C0B5D2"], // Darker, more muted for dark mode
    accent: "text-slate-800",
    darkAccent: "text-slate-200",
    text: "text-slate-900",
    darkText: "text-white",
    subtleText: "text-slate-700",
    darkSubtleText: "text-slate-100",
  },
  // Legacy support for old weather keys
  clear: {
    gradient: ["#FFD580", "#FFF9E3"],
    darkGradient: ["#CCAA66", "#CCCCB3"],
    accent: "text-amber-800",
    darkAccent: "text-amber-300",
    text: "text-slate-900",
    darkText: "text-slate-900",
    subtleText: "text-slate-700",
    darkSubtleText: "text-slate-700",
  },
  cloudy: {
    gradient: ["#CDE3F5", "#F2F2F2"],
    darkGradient: ["#ADC3D5", "#D2D2D2"],
    accent: "text-slate-700",
    darkAccent: "text-slate-300",
    text: "text-slate-900",
    darkText: "text-slate-900",
    subtleText: "text-slate-600",
    darkSubtleText: "text-slate-600",
  },
  rainy: {
    gradient: ["#9CBED7", "#D1E2EA"],
    darkGradient: ["#7C9EB7", "#B1C2DA"],
    accent: "text-slate-800",
    darkAccent: "text-slate-200",
    text: "text-slate-900",
    darkText: "text-white",
    subtleText: "text-slate-700",
    darkSubtleText: "text-slate-100",
  },
  stormy: {
    gradient: ["#B38DCB", "#5D7AA2"],
    darkGradient: ["#936DAB", "#4D5A82"], // Slightly darker for dark mode
    accent: "text-indigo-50",
    darkAccent: "text-indigo-200",
    text: "text-white",
    darkText: "text-white",
    subtleText: "text-indigo-100",
    darkSubtleText: "text-indigo-200",
  },
  quiet: {
    gradient: ["#B6B6D8", "#E0D5F2"],
    darkGradient: ["#9696B8", "#C0B5D2"],
    accent: "text-slate-800",
    darkAccent: "text-slate-200",
    text: "text-slate-900",
    darkText: "text-white",
    subtleText: "text-slate-700",
    darkSubtleText: "text-slate-100",
  },
};

type WeatherSupport = {
  headline: string;
  message: string;
};

const weatherSupportMessages: Record<string, WeatherSupport> = {
  sparky: {
    headline: "Channel the spark",
    message: "Your energy is high but scattered. Pick one thing and let the rest wait—focus that spark.",
  },
  steady: {
    headline: "Shine with intention",
    message: "Use this steady energy on one meaningful move, then let yourself coast.",
  },
  flowing: {
    headline: "Move at your pace",
    message: "You're moving, just slowly. Lower the bar, add softness, and rest between small bursts.",
  },
  foggy: {
    headline: "One gentle thing",
    message: "Pick a single tiny task and keep it simple—foggy brains crave easy wins.",
  },
  resting: {
    headline: "Rest is productive",
    message: "Tend to essentials only. Your system needs recovery—honor that need.",
  },
  // Legacy support for old weather keys
  clear: {
    headline: "Shine with intention",
    message: "Use this steady energy on one meaningful move, then let yourself coast.",
  },
  cloudy: {
    headline: "One gentle thing",
    message: "Pick a single tiny task and keep it simple—cloudy brains crave easy wins.",
  },
  rainy: {
    headline: "Move at rain speed",
    message: "Lower the bar, add softness, and rest between small bursts.",
  },
  stormy: {
    headline: "Protect your system",
    message: "Shrink the work, add support, and pause often. Safety first.",
  },
  quiet: {
    headline: "Keep input low",
    message: "Tend to essentials only; quiet energy loves calm pacing.",
  },
};

const defaultWeatherSupport: WeatherSupport = {
  headline: "Keep it gentle",
  message: "Listen to your energy and choose the kindest next step.",
};

type BarrierSupport = {
  action: string;
  kitSlug?: string;
};

const barrierSupportLibrary: Record<string, BarrierSupport> = {
  "low-energy": {
    action: "Choose the lightest version of your task—sit, lean, or do it from the coziest spot available.",
    kitSlug: "i-dont-have-energy",
  },
  "no-motivation": {
    action: "Pair the task with comfort: music, a warm drink, or a small reward waiting after.",
    kitSlug: "i-feel-emotionally-blocked",
  },
  "decision-fatigue": {
    action: "Limit yourself to two choices, flip a coin, and work with whichever side lands first.",
    kitSlug: "too-many-decisions",
  },
  "stuck-frozen": {
    action: "Name the first physical motion—open the tab, lay out the supplies—then pause and notice you moved.",
    kitSlug: "i-feel-frozen",
  },
  "cant-focus": {
    action: "Try a body double, a short timer, or a sound change to gently invite your brain back in bursts.",
    kitSlug: "i-got-distracted",
  },
  overwhelm: {
    action: "Shrink the scope to one tile in the mosaic and park the rest on paper to calm your brain.",
    kitSlug: "it-feels-too-big",
  },
  "no-time": {
    action: "Give it five minutes and let anything beyond that be extra credit.",
    kitSlug: "i-dont-have-time",
  },
  "perfection-loop": {
    action: "Decide on the 'good-enough' version and send the messy draft before your brain renegotiates.",
    kitSlug: "im-afraid-ill-fail",
  },
  "keep-avoiding-it": {
    action: "Set a five-minute timer, touch the tiniest piece once, and celebrate closing that loop.",
    kitSlug: "i-keep-avoiding-it",
  },
  "shame-guilt": {
    action: "Offer yourself repair, not punishment—do one kind action today and let it count.",
    kitSlug: "i-already-failed",
  },
  "feeling-alone": {
    action: "Grab a body double, text someone, or simply say it aloud so your nervous system feels less solo.",
    kitSlug: "i-feel-alone",
  },
  "waiting-on-someone": {
    action: "Send one short nudge or script your next reply, then reclaim your focus elsewhere.",
    kitSlug: "waiting-on-someone",
  },
};

const defaultBarrierSupport: BarrierSupport = {
  action: "Offer yourself one tiny kindness. Breathe, sip water, and pick the next soft step when you’re ready.",
};

const ADHD_KIT_BASE_URL = "https://adhd-first-aid.vercel.app/barriers";
const ADHD_KIT_CATEGORY_PARAM = encodeURIComponent("View All");

function getWeatherSupport(key?: string | null): WeatherSupport {
  return weatherSupportMessages[key ?? ""] ?? defaultWeatherSupport;
}

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

type WallpaperThemeKey = "auto" | "sunset" | "forest" | "dusk" | "ocean" | "lavender";

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
    name: "Emerald Mist",
    gradient: ["#11998e", "#38ef7d"],
    accent: "text-emerald-50",
    text: "text-white",
    subtleText: "text-emerald-50/90",
  },
  dusk: {
    name: "Purple Dreams",
    gradient: ["#667eea", "#764ba2"],
    accent: "text-purple-50",
    text: "text-white",
    subtleText: "text-purple-50/90",
  },
  ocean: {
    name: "Ocean Breeze",
    gradient: ["#00c9ff", "#92fe9d"],
    accent: "text-cyan-900",
    text: "text-slate-900",
    subtleText: "text-slate-700",
  },
  lavender: {
    name: "Lavender Fields",
    gradient: ["#d299c2", "#fef9d7"],
    accent: "text-purple-900",
    text: "text-slate-900",
    subtleText: "text-purple-900/70",
  },
};

function resolveWallpaperTheme(weatherKey: string | null, theme: WallpaperThemeKey) {
  if (theme !== "auto") {
    return customWallpaperThemes[theme];
  }
  return getWeatherTheme(weatherKey);
}

const wallpaperThemeOptions: Array<{ key: WallpaperThemeKey; label: string }> = [
              { key: "auto", label: "Match energy" },
  { key: "sunset", label: "Sunset Bloom" },
  { key: "forest", label: "Emerald Mist" },
  { key: "dusk", label: "Purple Dreams" },
  { key: "ocean", label: "Ocean Breeze" },
  { key: "lavender", label: "Lavender Fields" },
];

function getBarrierSupport(slug?: string | null): BarrierSupport {
  if (!slug) return defaultBarrierSupport;
  return barrierSupportLibrary[slug] ?? defaultBarrierSupport;
}

function getBarrierKitUrl(kitSlug?: string | null) {
  if (!kitSlug) return null;
  return `${ADHD_KIT_BASE_URL}/${kitSlug}?category=${ADHD_KIT_CATEGORY_PARAM}`;
}

export default function GentleSupportScreen() {
  const router = useRouter();
  const { weather, forecastNote, focusItems, checkinDate, clearLocalStorageForDate } = useCheckIn();
  const activeFocusItems = useMemo(() => focusItems.filter((item) => !item.completed), [focusItems]);
  const { user, loading: authLoading, error: authError } = useSupabaseUser();
  const forecastRef = useRef<HTMLDivElement>(null);
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [done, setDone] = useState(false);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastData | null>(null);
  const [exportingImage, setExportingImage] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [wallpaperTheme, setWallpaperTheme] = useState<WallpaperThemeKey>("auto");
  const [deviceDimensions, setDeviceDimensions] = useState<{ width: number; height: number; aspectRatio: string }>({
    width: 390,
    height: 844,
    aspectRatio: "9 / 19.5",
  });

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
    getBarrierTypes()
      .then((types) => {
        if (!mounted) return;
        setBarrierTypes(types);
      })
      .catch((error) => {
        console.error("Error loading barrier types", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!exportMessage) return;
    const timer = window.setTimeout(() => setExportMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [exportMessage]);

  // Transition from success message to forecast after 1.5 seconds
  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => {
      setShowSuccess(false);
      setDone(true);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  // Redirect to home after showing the forecast image
  useEffect(() => {
    if (done && dailyForecast) {
      // Show the image for 3 seconds, then redirect to home
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [done, dailyForecast, router]);

  useEffect(() => {
    // Detect device type and set appropriate dimensions
    const detectDevice = () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return;
      }

      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      
      // Get screen dimensions
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      
      // Common device dimensions (in logical pixels)
      // iPhone models typically have taller aspect ratios
      let width = 390;
      let height = 844;
      let aspectRatio = "9 / 19.5"; // Taller than standard 9:16

      if (isIOS) {
        // iPhone models - use taller aspect ratios
        // iPhone 14 Pro Max: 430x932 (9:19.5)
        // iPhone 14 Pro: 393x852 (9:19.5)
        // iPhone SE: 375x667 (9:16) - but we'll use taller for consistency
        if (screenWidth >= 428) {
          // iPhone Pro Max / Plus
          width = 430;
          height = 932;
          aspectRatio = "9 / 19.5";
        } else if (screenWidth >= 390) {
          // iPhone Pro / Standard
          width = 393;
          height = 852;
          aspectRatio = "9 / 19.5";
        } else {
          // iPhone SE / smaller
          width = 375;
          height = 812;
          aspectRatio = "9 / 19.5";
        }
      } else if (isAndroid) {
        // Android devices vary, but many modern phones are tall
        // Common: 360x800 (9:20), 412x915 (9:20)
        if (screenWidth >= 412) {
          width = 412;
          height = 915;
          aspectRatio = "9 / 20";
        } else if (screenWidth >= 360) {
          width = 360;
          height = 800;
          aspectRatio = "9 / 20";
        } else {
          width = 360;
          height = 800;
          aspectRatio = "9 / 20";
        }
      } else {
        // Desktop or unknown - use iPhone-like dimensions for consistency
        width = 390;
        height = 844;
        aspectRatio = "9 / 19.5";
      }

      setDeviceDimensions({ width, height, aspectRatio });
    };

    detectDevice();
  }, []);

  const barrierBySlug = useMemo(() => {
    return barrierTypes.reduce<Record<string, BarrierType>>((acc, type) => {
      acc[type.slug] = type;
      return acc;
    }, {});
  }, [barrierTypes]);
  const weatherSupport = getWeatherSupport(weather?.key);

  const canSave = useMemo(() => {
    return Boolean(user) && !saving && activeFocusItems.every((item) => hasBarrierSelection(item.barrier));
  }, [user, saving, activeFocusItems]);

  if (!dailyForecast && (!weather || !activeFocusItems.length)) {
    return null;
  }

  async function captureForecastCanvas() {
    if (!forecastRef.current) return null;
    
    // Temporarily set exact dimensions for accurate capture
    const originalStyle = forecastRef.current.style.cssText;
    forecastRef.current.style.width = `${deviceDimensions.width}px`;
    forecastRef.current.style.height = `${deviceDimensions.height}px`;
    forecastRef.current.style.aspectRatio = 'unset';
    
    try {
      const canvas = await html2canvas(forecastRef.current, {
        backgroundColor: null,
        scale: 2,
        width: deviceDimensions.width,
        height: deviceDimensions.height,
        useCORS: true,
      });
      
      // Restore original styles
      forecastRef.current.style.cssText = originalStyle;
      
      return canvas;
    } catch (error) {
      // Restore original styles even on error
      forecastRef.current.style.cssText = originalStyle;
      throw error;
    }
  }

  function canvasToBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  async function handleSaveImage() {
    if (!dailyForecast || !dailyForecast.checkinId) return;
    setExportingImage(true);
    try {
      const canvas = await captureForecastCanvas();
      if (!canvas) throw new Error("Unable to capture forecast.");
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      const checkinIdPrefix = dailyForecast.checkinId.slice(0, 8) || 'forecast';
      link.download = `daily-forecast-${checkinIdPrefix}.png`;
      link.click();
      setExportMessage("Saved to downloads.");
    } catch (error: unknown) {
      console.error('Error saving image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to save image.';
      setExportMessage(errorMessage);
    } finally {
      setExportingImage(false);
    }
  }

  async function handleShareImage() {
    if (!dailyForecast || !dailyForecast.checkinId) {
      await handleSaveImage();
      return;
    }

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
      const checkinIdPrefix = dailyForecast.checkinId.slice(0, 8) || 'forecast';
      const fileName = `daily-forecast-${checkinIdPrefix}.png`;
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
    } catch (error: unknown) {
      // AbortError is thrown when user cancels share dialog - don't show error
      if (error instanceof Error && error.name !== "AbortError") {
        console.error(error);
        setExportMessage("Share unavailable.");
      } else if (!(error instanceof Error)) {
        // Handle non-Error objects
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
      const snapshotTasks: ForecastTask[] = activeFocusItems.map((item) => {
        const slug = item.barrier?.barrierTypeSlug ?? null;
        const friendlyBarrier = slug ? barrierBySlug[slug] : null;
        return {
          id: item.id,
          description: item.description,
          anchorType: item.anchorType ?? null,
          anchorValue: item.anchorValue ?? null,
          emoji: getCategoryEmoji(item.categories[0]) || null,
          barrierSlug: slug,
          barrierLabel: friendlyBarrier?.label ?? item.barrier?.custom ?? null,
        };
      });

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
      
      // Clear localStorage after successful save (database is now source of truth)
      clearLocalStorageForDate(checkinDate);
      
      // Show success message before transitioning to forecast (Option A)
      setShowSuccess(true);
      // Note: resetCheckIn() removed - don't clear state until navigation completes
      // The 'done' state prevents re-entry, and state will reset on next check-in start
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong while saving.";
      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  // Show success message before forecast (Option A)
  if (showSuccess && dailyForecast) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="mx-auto max-w-md text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4 transition-all duration-300 scale-100">
            <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-all duration-500">
            Check-in saved! ✨
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 transition-all duration-500">
            Your daily forecast is ready.
          </p>
        </div>
      </main>
    );
  }

  if (done && dailyForecast) {
    const theme = resolveWallpaperTheme(dailyForecast.weather.key, wallpaperTheme);
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
              href="/"
              className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-600">Daily Forecast</p>
              <h1 className="text-2xl font-bold text-slate-900">Your Daily Forecast</h1>
              <p className="text-sm text-slate-600">Save as wallpaper to keep today&rsquo;s energy and focus close.</p>
            </div>
          </header>

          <section className="flex justify-center">
            <div className="w-full" style={{ maxWidth: `${deviceDimensions.width}px` }}>
              <div
                ref={forecastRef}
                className="relative w-full overflow-hidden rounded-[48px] shadow-2xl"
                style={{
                  aspectRatio: deviceDimensions.aspectRatio,
                }}
              >
                <div
                  className="relative h-full p-8"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                  }}
                >
                  {/* Focus list positioned at 70% down the page */}
                  <div className={`absolute left-8 right-8 rounded-3xl bg-white/25 p-6 backdrop-blur ${anchorItemText}`} style={{ top: '70%' }}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-4 ${anchorHeadingClass}`}>
                      Today&rsquo;s focus list
                    </p>
                    <ul className="space-y-3 text-base font-semibold">
                      {dailyForecast.tasks.map((task) => (
                        <li key={task.id} className="flex items-start gap-2">
                          <span className="text-2xl leading-none">{task.emoji || "•"}</span>
                          <span>{buildAnchorPhrase(task.description, task.anchorType, task.anchorValue)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
            <p className="text-sm uppercase tracking-wide text-cyan-600">Support</p>
            <h1 className="text-2xl font-bold text-slate-900">Gentle support</h1>
            <p className="text-sm text-slate-600">Soft reminders matched to each barrier.</p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm space-y-4 dark:border-slate-700/30 dark:bg-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{weather?.icon}</div>
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Energy type</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{weather?.label}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{weather?.description}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
                {weatherSupport.headline}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{weatherSupport.message}</p>
            </div>
          </div>
          {forecastNote && (
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-700/50 dark:text-slate-200">
              {forecastNote}
            </p>
          )}
        </section>

        <section className="space-y-4">
          {activeFocusItems.map((item) => {
            const slug = item.barrier?.barrierTypeSlug;
            const friendlyBarrier = slug ? barrierBySlug[slug] : null;
            const barrierSupport = getBarrierSupport(slug);
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
                  <p className="text-sm leading-relaxed">{barrierSupport.action}</p>
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
