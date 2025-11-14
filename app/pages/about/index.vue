<template>
  <div class="container mx-auto px-4 py-8 space-y-8">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">О НАС</h1>
    </div>

    <div class="hero bg-base-200 rounded-box">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <p class="mb-5">
            <strong>DNS</strong> — федеральная розничная сеть, специализирующаяся на продаже цифровой и бытовой техники. В наших
            магазинах вы найдёте смартфоны, ноутбуки, телевизоры, кухонную и крупную бытовую технику от ведущих производителей.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Наша история</h2>
          <p>
            Сеть DNS была основана как небольшой магазин электроники и за годы выросла в крупную федеральную компанию с десятками филиалов
            и интернет-магазином. На протяжении развития мы постоянно расширяли ассортимент и улучшали сервис.
          </p>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Миссия компании</h2>
          <p>
            Наша миссия — сделать современные цифровые технологии доступными и понятными каждому. Мы помогаем клиентам выбирать технику,
            которая улучшит повседневную жизнь.
          </p>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Наша команда</h2>
        <p class="mb-4">Над качеством обслуживания работают:</p>
        <ul class="list-disc list-inside space-y-2">
          <li>Менеджеры по продажам — помогают выбрать подходящий товар</li>
          <li>Технические специалисты — проводят диагностику и обслуживание</li>
          <li>Логистика и служба доставки — обеспечивают своевременную доставку заказов</li>
          <li>Служба поддержки — отвечает на вопросы клиентов и помогает с возвратами</li>
        </ul>
      </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Преимущества покупки в DNS</h2>
        <ol class="list-decimal list-inside space-y-2">
          <li>Широкий ассортимент более 100 000 товаров</li>
          <li>Официальная гарантия от производителя</li>
          <li>Бесплатная доставка при заказе от 2000 рублей</li>
          <li>Возврат товара в течение 14 дней</li>
          <li>Программа лояльности с накоплением бонусов</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'О нас — DNS Магазин' });
</script>
