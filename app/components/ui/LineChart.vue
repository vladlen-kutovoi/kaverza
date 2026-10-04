<script setup lang="ts">
// --- Types -----------------------------------------------------------
import type { ChartPoint } from "~/interfaces/components/ui/chart";

// --- Props -----------------------------------------------------------
const props = withDefaults(
  defineProps<{
    points: ChartPoint[];
    /** Line colour; defaults to the accent */
    color?: string;
    /** Pin the vertical scale, e.g. 0-100 for a percentage */
    min?: number;
    max?: number;
    /** Appended to the axis readings, e.g. "%" */
    suffix?: string;
    /** Plot height in pixels */
    height?: number;
  }>(),
  {
    color: "var(--accent)",
    suffix: "",
    height: 160,
  },
);

// --- Variables --------------------------------------------------------
// Unique per instance, so several charts on a page keep their own fill
const gradientId = `chart-${useId()}`;

// The viewBox is stretched to fill the box (preserveAspectRatio="none"),
// so geometry distorts. Hence non-scaling-stroke on the strokes, and
// HTML dots positioned in percentages instead of <circle>s - both stay
// round and evenly weighted at any width.
const TOP = 6;
const BOTTOM = 94;

// --- Computed ---------------------------------------------------------
const scale = computed(() => {
  const values = props.points.map((point) => point.value);
  let low = props.min ?? Math.min(...values);
  let high = props.max ?? Math.max(...values);

  // A flat series would divide by zero; pad it so the line sits centred
  if (low === high) {
    low -= 1;
    high += 1;
  }

  return { low, high };
});

const plotted = computed(() =>
  props.points.map((point, index) => {
    const { low, high } = scale.value;
    const share = (point.value - low) / (high - low);

    return {
      ...point,
      x:
        props.points.length === 1
          ? 50
          : (index / (props.points.length - 1)) * 100,
      y: BOTTOM - share * (BOTTOM - TOP),
    };
  }),
);

const linePoints = computed(() =>
  plotted.value.map((point) => `${point.x},${point.y}`).join(" "),
);

const areaPath = computed(() => {
  const first = plotted.value[0];
  const last = plotted.value[plotted.value.length - 1];

  if (!first || !last) return "";

  const line = plotted.value
    .map((point) => `L ${point.x},${point.y}`)
    .join(" ");

  return `M ${first.x},100 ${line} L ${last.x},100 Z`;
});

const axisLabels = computed(() => ({
  high: `${Math.round(scale.value.high)}${props.suffix}`,
  low: `${Math.round(scale.value.low)}${props.suffix}`,
}));

// Screen readers get the shape as a sentence, since the SVG is decorative
const summary = computed(() => {
  const values = props.points.map((point) => point.value);
  const first = values[0];
  const last = values[values.length - 1];

  return `Графік: від ${first}${props.suffix} до ${last}${props.suffix} за ${values.length} точок.`;
});
</script>
<template>
  <div v-if="points.length > 1" class="flex gap-3" role="img" :aria-label="summary">
    <!-- Axis readings live in HTML, not the SVG, so they keep their size
         however wide or narrow the chart gets -->
    <div
      class="flex shrink-0 flex-col justify-between py-0.5 text-right font-mono text-sm tabular-nums text-muted"
    >
      <span>{{ axisLabels.high }}</span>
      <span>{{ axisLabels.low }}</span>
    </div>

    <div class="relative flex-1" :style="{ height: `${height}px` }">
      <svg
        class="absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="color" stop-opacity="0.28" />
            <stop offset="100%" :stop-color="color" stop-opacity="0" />
          </linearGradient>
        </defs>

        <line
          v-for="row in [TOP, 50, BOTTOM]"
          :key="row"
          x1="0"
          :y1="row"
          x2="100"
          :y2="row"
          stroke="var(--line)"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />

        <path :d="areaPath" :fill="`url(#${gradientId})`" />

        <polyline
          :points="linePoints"
          fill="none"
          :stroke="color"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>

      <!-- Native title tooltips: no JS, no positioning to maintain -->
      <span
        v-for="(point, index) in plotted"
        :key="index"
        class="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bg"
        :style="{ left: `${point.x}%`, top: `${point.y}%`, background: color }"
        :title="point.label"
      />
    </div>
  </div>

  <p v-else class="text-base text-muted">Недостатньо даних для графіка.</p>
</template>
