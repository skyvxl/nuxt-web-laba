<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Заголовок -->
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-3">Контакты</h1>
      <p class="text-base-content/60 max-w-xl mx-auto">
        Свяжитесь с нами любым удобным способом. Мы всегда рады помочь!
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <!-- Форма обратной связи -->
      <div class="card bg-base-100 shadow-xl h-fit">
        <div class="card-body p-5 sm:p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-12 h-12 bg-base-200 rounded-xl flex items-center justify-center"
            >
              <Icon
                name="heroicons:envelope"
                class="w-6 h-6 text-base-content"
              />
            </div>
            <div>
              <h2 class="text-xl font-bold">Напишите нам</h2>
              <p class="text-base-content/60 text-sm">
                Ответим в течение 24 часов
              </p>
            </div>
          </div>

          <form class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput title="Имя" placeholder="Ваше имя" type="text" />
              <BaseInput
                title="Телефон"
                placeholder="+7 (___) ___-__-__"
                type="tel"
              />
            </div>

            <BaseInput
              title="Email"
              placeholder="your@email.com"
              type="email"
            />
            <BaseInput title="Тема" placeholder="Тема сообщения" type="text" />

            <div class="w-full">
              <div class="label">
                <span class="label-text font-medium">Сообщение</span>
              </div>
              <textarea
                id="contact-message"
                class="textarea textarea-bordered w-full h-32 resize-none focus:textarea-secondary"
                placeholder="Опишите ваш вопрос..."
              />
            </div>

            <button type="submit" class="btn btn-block">
              <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
              Отправить сообщение
            </button>
          </form>
        </div>
      </div>

      <!-- Контактная информация -->
      <div class="space-y-6">
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-6 sm:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-12 h-12 bg-base-200 rounded-xl flex items-center justify-center"
              >
                <Icon
                  name="heroicons:building-office-2"
                  class="w-6 h-6 text-base-content"
                />
              </div>
              <h2 class="text-xl font-bold">Контактная информация</h2>
            </div>

            <div class="space-y-4">
              <div
                class="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <div
                  class="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center shrink-0"
                >
                  <Icon name="heroicons:phone" class="w-5 h-5 text-success" />
                </div>
                <div>
                  <p class="text-sm text-base-content/60">
                    Телефон горячей линии
                  </p>
                  <a
                    href="tel:88007707999"
                    class="font-semibold text-lg transition-colors"
                  >
                    8 (800) 770-79-99
                  </a>
                  <p class="text-xs text-base-content/50">
                    Бесплатно по России
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <div
                  class="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center shrink-0"
                >
                  <Icon name="heroicons:envelope" class="w-5 h-5 text-info" />
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Email</p>
                  <a
                    href="mailto:info@dns-shop.ru"
                    class="font-semibold transition-colors"
                  >
                    info@dns-shop.ru
                  </a>
                </div>
              </div>

              <div
                class="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <div
                  class="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0"
                >
                  <Icon name="heroicons:map-pin" class="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p class="text-sm text-base-content/60">Адрес офиса</p>
                  <p class="font-semibold">ул. Городская, 24</p>
                  <p class="text-sm text-base-content/70">
                    п. Троицк, Москва, 108841
                  </p>
                </div>
              </div>

              <div
                class="flex items-start gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <div
                  class="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center shrink-0"
                >
                  <Icon name="heroicons:clock" class="w-5 h-5 text-error" />
                </div>
                <div>
                  <p class="text-sm text-base-content/60">График работы</p>
                  <p class="font-semibold">Ежедневно с 10:00 до 21:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Карта -->
        <div class="card bg-base-100 shadow-xl overflow-hidden">
          <div class="card-body p-0">
            <div class="p-4 pb-0 flex items-center gap-3">
              <div
                class="w-10 h-10 bg-base-200 rounded-lg flex items-center justify-center"
              >
                <Icon name="heroicons:map" class="w-5 h-5 text-base-content" />
              </div>
              <h2 class="font-bold">Как нас найти</h2>
            </div>
            <div class="w-full h-64 mt-4">
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
