<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-4">КОНТАКТЫ</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Напишите нам</h2>
          <form class="space-y-6">
            <BaseInput title="Имя" placeholder="Ваше имя" type="text" />
            <BaseInput
              title="Email"
              placeholder="your@email.com"
              type="email"
            />
            <BaseInput
              title="Телефон"
              placeholder="+7 (___) ___-__-__"
              type="tel"
            />
            <BaseInput title="Тема" placeholder="Тема сообщения" type="text" />

            <div class="w-full">
              <div class="label">
                <span class="label-text">Сообщение</span>
              </div>
              <textarea
                id="contact-message"
                class="textarea textarea-bordered w-full h-24 resize-none"
                placeholder="Ваше сообщение..."
              />
            </div>

            <div class="form-control mt-6">
              <button
                type="submit"
                class="btn btn-ghost border-2 border-base-content/20"
              >
                Отправить
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Адрес</h2>
            <div class="space-y-2">
              <p>
                <strong>Телефон горячей линии:</strong> 8 (800) 770-79-99
                (бесплатно по России)
              </p>
              <p><strong>Email:</strong> info@dns-shop.ru</p>
              <p>
                <strong>Один из офисов:</strong> Троицк, Троицк на Городской,
                ул. Городская, 24, поселение Троицк, Москва, 108841
              </p>
              <p><strong>График работы:</strong> Ежедневно с 10:00 до 21:00</p>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Как нас найти</h2>
            <div class="w-full h-64 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18082.574390573463!2d37.28590598095916!3d55.49191752380388!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x414aabb6c52a1947:0x718ae425a4b0439!2sDNS!5e0!3m2!1sru!2sru!4v1761467100254!5m2!1sru!2sru"
                width="100%"
                height="100%"
                style="border: 0"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: "Контакты — DNS Магазин",
  meta: [
    {
      name: "description",
      content:
        "Контактные данные DNS, обращения в службу поддержки и реквизиты.",
    },
  ],
});
</script>
