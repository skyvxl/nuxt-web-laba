<template>
  <div>
    <div class="hero bg-base-200 min-h-[60vh] overflow-hidden">
      <div class="hero-content text-center px-4">
        <div class="max-w-md mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold">DNS Магазин</h1>
          <p class="py-6">Крупнейшая федеральная розничная сеть по продаже цифровой и бытовой техники в России</p>
          <NuxtLink class="btn btn-ghost border-2 border-base-content/20" to="/catalog">Перейти в каталог</NuxtLink>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8 space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">О нас</h2>
            <p>
              DNS — федеральная розничная сеть, специализирующаяся на продаже цифровой и бытовой техники. Мы стремимся
              комбинировать широкий ассортимент с понятной ценовой политикой и высоким уровнем сервиса.
            </p>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">История фирмы</h2>
            <p>
              Сеть DNS была основана как небольшой магазин электроники и за годы выросла в крупную федеральную
              компанию с десятками филиалов по всей России. Сегодня DNS — это один из лидеров рынка электроники в стране.
            </p>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Популярные категории товаров</h2>
          <div class="hidden lg:block overflow-x-auto">
            <table class="table table-zebra">
              <tbody>
                <tr>
                  <td><strong>Смартфоны</strong> - iPhone, Samsung, Xiaomi</td>
                  <td><strong>Ноутбуки</strong> - ASUS, Lenovo, HP</td>
                  <td rowspan="2" class="text-center">
                    <div class="badge badge-primary">Цифровая техника</div>
                    <br>
                    с гарантией и доставкой
                  </td>
                </tr>
                <tr>
                  <td><strong>Телевизоры</strong> - LED, OLED, QLED</td>
                  <td><strong>Наушники</strong> - проводные, беспроводные</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-center">
                    <strong>Бытовая техника</strong> - холодильники, стиральные машины, пылесосы
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="block lg:hidden mt-4 space-y-3">
            <div class="p-4 bg-base-100 rounded-lg shadow">
              <h3 class="font-bold mb-2">Смартфоны</h3>
              <div class="text-sm">iPhone, Samsung, Xiaomi</div>
            </div>
            <div class="p-4 bg-base-100 rounded-lg shadow">
              <h3 class="font-bold mb-2">Ноутбуки</h3>
              <div class="text-sm">ASUS, Lenovo, HP</div>
            </div>
            <div class="p-4 bg-base-100 rounded-lg shadow">
              <h3 class="font-bold mb-2">Телевизоры</h3>
              <div class="text-sm">LED, OLED, QLED</div>
            </div>
            <div class="p-4 bg-base-100 rounded-lg shadow">
              <h3 class="font-bold mb-2">Наушники</h3>
              <div class="text-sm">проводные, беспроводные</div>
            </div>
            <div class="p-4 bg-base-100 rounded-lg shadow flex items-center justify-between">
              <div>
                <h3 class="font-bold mb-2">Цифровая техника</h3>
                <div class="text-sm">с гарантией и доставкой</div>
              </div>
            </div>
            <div class="p-4 bg-base-100 rounded-lg shadow">
              <h3 class="font-bold mb-2">Бытовая техника</h3>
              <div class="text-sm">холодильники, стиральные машины, пылесосы</div>
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
            Позволяет накапливать бонусы при каждой покупке и использовать их для оплаты следующих заказов.
            <em>Эксклюзивные предложения</em> для постоянных клиентов включают дополнительные скидки, приоритетную доставку
            и расширенную гарантию.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Главная — DNS Магазин',
  meta: [
    {
      name: 'description',
      content: 'DNS магазин электроники: лучшие предложения на смартфоны, ноутбуки и бытовую технику.',
    },
  ],
});
</script>
