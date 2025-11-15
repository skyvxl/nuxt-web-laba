<template>
  <div>
    <div class="hero bg-base-200 min-h-[60vh] overflow-hidden">
      <div class="hero-content text-center px-4">
        <div class="max-w-md mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold">DNS Магазин</h1>
          <p class="py-6">
            Крупнейшая федеральная розничная сеть по продаже цифровой и бытовой
            техники в России
          </p>
          <NuxtLink
            class="btn btn-ghost border-2 border-base-content/20"
            to="/catalog"
            >Перейти в каталог</NuxtLink
          >
        </div>
      </div>
    </div>

    <div class="container mx-auto space-y-8 px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">О нас</h2>
            <p>
              DNS — федеральная розничная сеть, специализирующаяся на продаже
              цифровой и бытовой техники. Мы стремимся комбинировать широкий
              ассортимент с понятной ценовой политикой и высоким уровнем
              сервиса.
            </p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">История фирмы</h2>
            <p>
              Сеть DNS была основана как небольшой магазин электроники и за годы
              выросла в крупную федеральную компанию с десятками филиалов по
              всей России. Сегодня DNS — это один из лидеров рынка электроники в
              стране.
            </p>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Популярные категории товаров</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-base-content/10 p-4">
              <p class="text-sm text-base-content/60">Смартфоны</p>
              <p class="text-lg font-semibold">
                Apple iPhone · Samsung · Xiaomi
              </p>
            </div>
            <div class="rounded-lg border border-base-content/10 p-4">
              <p class="text-sm text-base-content/60">Ноутбуки</p>
              <p class="text-lg font-semibold">
                ASUS ROG · Lenovo Legion · HP Victus
              </p>
            </div>
            <div class="rounded-lg border border-base-content/10 p-4">
              <p class="text-sm text-base-content/60">Телевизоры</p>
              <p class="text-lg font-semibold">OLED · QLED · MiniLED</p>
            </div>
            <div class="rounded-lg border border-base-content/10 p-4">
              <p class="text-sm text-base-content/60">Акустика и наушники</p>
              <p class="text-lg font-semibold">
                Sony WH-1000XM5 · AirPods Pro · JBL
              </p>
            </div>
            <div
              class="rounded-lg border border-base-content/10 p-4 md:col-span-2"
            >
              <p class="text-sm text-base-content/60">Бытовая техника</p>
              <p class="text-lg font-semibold">
                Холодильники, стиральные машины, роботы-пылесосы
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Преимущества покупки в DNS</h2>
            <ul class="list-disc list-inside space-y-2">
              <li>Широкий ассортимент более 100 000 товаров</li>
              <li>Гарантия лучшей цены и программа лояльности</li>
              <li>Бесплатная доставка при заказе от 2000 рублей</li>
            </ul>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Наши преимущества</h2>
            <ol class="list-decimal list-inside space-y-2">
              <li>Официальная гарантия от производителя</li>
              <li>Сервисные центры по всей России</li>
              <li>Возврат товара в течение 14 дней</li>
            </ol>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Программа лояльности DNS</h2>
          <p>
            Копите бонусы с каждой покупки и оплачивайте до 100% следующего
            заказа. Эксклюзивные предложения для постоянных клиентов:
            приоритетная доставка, дополнительная гарантия и персональные
            скидки.
          </p>
          <div
            class="stats stats-vertical w-full bg-base-200 text-base-content/80 mt-4 md:stats-horizontal"
          >
            <div class="stat">
              <div class="stat-title">Бонусы за год</div>
              <div class="stat-value">до 15%</div>
              <div class="stat-desc">возврат от покупок</div>
            </div>
            <div class="stat">
              <div class="stat-title">Премиум статус</div>
              <div class="stat-value">48ч</div>
              <div class="stat-desc">доставка в крупных городах</div>
            </div>
            <div class="stat">
              <div class="stat-title">Скидки</div>
              <div class="stat-value">до 30%</div>
              <div class="stat-desc">на аксессуары и сервис</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "Главная — DNS Магазин",
  meta: [
    {
      name: "description",
      content:
        "DNS магазин электроники: лучшие предложения на смартфоны, ноутбуки и бытовую технику.",
    },
  ],
});
</script>
