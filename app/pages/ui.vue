<script setup lang="ts">
// --- Meta -------------------------------------------------------------
useHead({ title: "UI Kit" });

// --- Variables --------------------------------------------------------
const matches = [
  { id: 1, player: "Олена", hero: "Alice", score: 14, won: true },
  { id: 2, player: "Богдан", hero: "Sherlock Holmes", score: 11, won: false },
  { id: 3, player: "Марія", hero: "Medusa", score: 9, won: false },
];

// Two with art, one without, so the fallback is on show too
const cardbacks = [
  { name: "Медуза", slug: "meduza", color: "#4ade80" },
  { name: "Локі", slug: "loki", color: "#6366f1" },
  { name: "Без арту", slug: "no-art", color: "#f87171" },
];

// One with a portrait, one without, so the initial fallback is on show too
const avatarDemos = [
  { name: "Олена", avatar: "medusa-1" },
  { name: "Богдан", avatar: null },
];

const ratingSample = [1500, 1516, 1502, 1538, 1524, 1561, 1583, 1570, 1604].map(
  (value, index) => ({
    value,
    label: index === 0 ? `Старт · ${value}` : `Матч ${index} · ${value}`,
  }),
);

const winRateSample = [100, 50, 67, 50, 60, 50, 57, 63, 56].map(
  (value, index) => ({ value, label: `Матч ${index + 1} · ${value}%` }),
);

// --- Form state (showcase only) --------------------------------------
const nickname = ref("");
const brokenEmail = ref("не-пошта");
const notes = ref("");
const agreed = ref(true);
const side = ref("hero");
const avatarChoice = ref("loki-2");
const loadingDemo = ref(false);

// --- Methods ----------------------------------------------------------
function runLoadingDemo() {
  loadingDemo.value = true;
  setTimeout(() => (loadingDemo.value = false), 1600);
}
</script>

<template>
  <div class="container-page py-10 flex flex-col gap-12">
    <header class="flex flex-col gap-3">
      <h1>UI Kit</h1>
      <p class="text-muted max-w-2xl">
        Усе доступне як CSS-класи. Компоненти є лише там, де вони прибирають
        повторюваний код: перемикання тега, звʼязок label з полем, стан
        завантаження.
      </p>
    </header>

    <hr class="border-t border-line" />

    <!-- ============ Buttons ============ -->
    <section class="flex flex-col gap-5">
      <h2 class="section-heading">Кнопки</h2>

      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class="btn btn-primary">Основна</button>
        <button type="button" class="btn btn-secondary">Другорядна</button>
        <button type="button" class="btn btn-ghost">Прозора</button>
        <button type="button" class="btn btn-primary" disabled>Вимкнена</button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class="btn btn-secondary btn-sm">Мала</button>
        <button type="button" class="btn btn-secondary">Звичайна</button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UiButton :loading="loadingDemo" @click="runLoadingDemo">
          {{ loadingDemo ? "Збереження" : "Зберегти гру" }}
        </UiButton>
        <UiButton variant="secondary" to="/games">Перейти до ігор</UiButton>
      </div>

      <div class="max-w-sm">
        <UiButton block>На всю ширину</UiButton>
      </div>
    </section>

    <hr class="border-t border-line" />

    <!-- ============ Links ============ -->
    <section class="flex flex-col gap-4">
      <h2 class="section-heading">Посилання</h2>
      <p class="text-muted text-base">
        Текстове посилання:
        <NuxtLink to="/games" class="link">до списку ігор</NuxtLink>.
      </p>
      <nav class="flex flex-wrap gap-1">
        <NuxtLink to="/ui" class="link-nav">Активне</NuxtLink>
        <NuxtLink to="/games" class="link-nav">Ігри</NuxtLink>
        <NuxtLink to="/players" class="link-nav">Гравці</NuxtLink>
        <NuxtLink to="/characters" class="link-nav">Персонажі</NuxtLink>
      </nav>
    </section>

    <hr class="border-t border-line" />

    <!-- ============ Cards ============ -->
    <section class="flex flex-col gap-5">
      <h2 class="section-heading">Картки</h2>
      <p class="text-muted text-base">
        <code>.card</code> — універсальна поверхня. Вміст компонується
        утилітами Tailwind; окремі класи є лише для заголовка та футера.
      </p>

      <div class="grid-auto">
        <div class="card">
          <p class="card-title">Проста картка</p>
          <p class="text-muted text-base mt-1">
            Просто <code>class="card"</code> на будь-якому елементі.
          </p>
        </div>

        <NuxtLink to="/games" class="card card-interactive">
          <p class="card-title">Клікабельна</p>
          <p class="text-muted text-base mt-1">
            Наведіть — фон і заголовок підсвітяться.
          </p>
        </NuxtLink>

        <div class="card">
          <p class="card-title">З футером</p>
          <p class="text-muted text-base mt-1">Дії відділені лінією.</p>
          <div class="card-footer">
            <button type="button" class="btn btn-primary btn-sm">
              Підтвердити
            </button>
            <button type="button" class="btn btn-ghost btn-sm">
              Скасувати
            </button>
          </div>
        </div>
      </div>

      <p class="text-muted text-base">
        <code>UiCardback</code> — арт карти персонажа у пропорції 5:7. З <code>link</code>
        стає плиткою зі списку персонажів; без нього — просто арт. Якщо файла
        немає, показується перша літера на кольорі персонажа.
      </p>

      <div class="grid-auto max-w-2xl" style="--min: 11rem; --max: 3">
        <UiCardback v-for="demo in cardbacks" :key="demo.slug" :character="demo" link />
      </div>

      <p class="text-muted text-base">
        <code>UiAvatar</code> — портрет гравця. Один регулятор,
        <code>--avatar-size</code>, на самому елементі або на будь-якому
        батькові, тому варіантів розміру немає. Якщо аватара немає,
        показується перша літера імені.
      </p>

      <div class="flex items-center gap-4">
        <UiAvatar :player="avatarDemos[0]!" style="--avatar-size: 1.25rem" />
        <UiAvatar :player="avatarDemos[0]!" style="--avatar-size: 2.5rem" />
        <UiAvatar :player="avatarDemos[0]!" style="--avatar-size: 4.5rem" />
        <UiAvatar :player="avatarDemos[1]!" style="--avatar-size: 4.5rem" />
      </div>
    </section>

    <hr class="border-t border-line" />

    <!-- ============ Form ============ -->
    <section class="flex flex-col gap-5">
      <h2 class="section-heading">Форми</h2>

      <div class="grid-auto max-w-3xl" style="--min: 14rem">
        <UiInput v-model="nickname" label="Нікнейм" placeholder="Напр. Олена" required />
        <UiInput
          v-model="brokenEmail"
          label="Пошта"
          type="email"
          error="Введіть коректну адресу."
        />
        <UiInput label="Вимкнене" placeholder="Недоступно" disabled />

        <div class="field">
          <label class="label" for="demo-select">Гра</label>
          <select id="demo-select" class="select">
            <option>Unmatched: Cobble &amp; Fog</option>
            <option>Unmatched: Battle of Legends</option>
            <option>Unmatched: Jurassic Park</option>
          </select>
        </div>
      </div>

      <div class="max-w-3xl">
        <UiTextarea
          v-model="notes"
          label="Нотатки до матчу"
          placeholder="Як пройшла гра?"
        />
      </div>

      <div class="flex flex-col gap-3">
        <UiCheckbox v-model="agreed" label="Погоджуюсь з правилами" />
        <UiCheckbox label="Вимкнений" disabled />
        <div class="flex flex-wrap gap-6 mt-1">
          <UiCheckbox v-model="side" radio name="side" value="hero" label="Герой" />
          <UiCheckbox
            v-model="side"
            radio
            name="side"
            value="sidekick"
            label="Помічник"
          />
        </div>
      </div>

      <p class="text-muted text-base">
        <code>UiFormAvatar</code> — вибір портрета з наявних. Набір береться
        з <code>shared/utils/avatars.ts</code>, передавати опції не треба.
      </p>

      <div class="field max-w-3xl">
        <span class="label">Аватар</span>
        <UiFormAvatar v-model="avatarChoice" label="Аватар" />
      </div>

      <div class="popover max-w-56">
        <ul class="menu">
          <li><button type="button" class="menu-item">Alice</button></li>
          <li>
            <button type="button" class="menu-item" aria-selected="true">
              Medusa
            </button>
          </li>
          <li>
            <button type="button" class="menu-item">Sherlock Holmes</button>
          </li>
        </ul>
      </div>
    </section>

    <hr class="border-t border-line" />

    <!-- ============ Status ============ -->
    <section class="flex flex-col gap-5">
      <h2 class="section-heading">Статуси</h2>

      <div class="flex flex-wrap items-center gap-2">
        <span class="badge">Нейтральний</span>
        <span class="badge badge-accent">Акцент</span>
        <span class="badge badge-success">Перемога</span>
        <span class="badge badge-danger">Поразка</span>
      </div>

      <div class="flex flex-col gap-3 max-w-2xl">
        <div class="alert">Звичайне повідомлення.</div>
        <div class="alert alert-success">Гру додано до історії матчів.</div>
        <div class="alert alert-danger" role="alert">
          Не вдалося зберегти гру. Спробуйте ще раз.
        </div>
      </div>
    </section>

    <hr class="border-t border-line" />

    <!-- ============ Table ============ -->
    <section class="flex flex-col gap-4">
      <h2 class="section-heading">Таблиця</h2>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Гравець</th>
              <th>Персонаж</th>
              <th class="text-right">Очки</th>
              <th>Результат</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in matches" :key="match.id">
              <td>{{ match.player }}</td>
              <td class="text-muted">{{ match.hero }}</td>
              <td class="text-right font-mono tabular-nums">
                {{ match.score }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="match.won ? 'badge-success' : 'badge-danger'"
                >
                  {{ match.won ? "Перемога" : "Поразка" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <hr class="border-t border-line" />

    <!-- ============ Chart ============ -->
    <section class="flex flex-col gap-5">
      <h2 class="section-heading">Графіки</h2>
      <p class="text-base text-muted">
        Інлайн SVG, без залежностей. Наведіть на точку, щоб побачити значення.
      </p>

      <div class="grid-auto" style="--min: 18rem">
        <div class="card gap-3">
          <p class="card-title">Зміна рейтингу</p>
          <UiLineChart :points="ratingSample" />
        </div>

        <div class="card gap-3">
          <p class="card-title">Зміна вінрейту</p>
          <UiLineChart
            :points="winRateSample"
            color="#4ade80"
            :min="0"
            :max="100"
            suffix="%"
          />
        </div>
      </div>
    </section>

    <hr class="border-t border-line" />

    <!-- ============ Loading ============ -->
    <section class="flex flex-col gap-5">
      <h2 class="section-heading">Завантаження</h2>

      <div class="flex flex-wrap items-center gap-6">
        <span class="spinner" role="status" aria-label="Завантаження" />
        <span class="spinner text-xl text-accent-text" role="status" aria-label="Завантаження" />
      </div>

      <div class="card max-w-sm gap-2.5">
        <div class="skeleton h-4 w-2/3" />
        <div class="skeleton h-3 w-full" />
        <div class="skeleton h-3 w-4/5" />
      </div>
    </section>
  </div>
</template>
