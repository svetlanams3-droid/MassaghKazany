import { useState, useEffect, useMemo } from 'react';

// Admin password (change this to modify access)
const ADMIN_PASSWORD = 'admin123';

// Available time slots for booking
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

// Default content data
const DEFAULT_CONTENT = {
  heroTitle: 'Верните легкость телу за 60 минут в центре Казани',
  heroSubtitle: 'Профессиональный массаж от сертифицированных мастеров. Натуральные масла, атмосфера спокойствия и индивидуальный подход к каждому клиенту.',
  aboutTitle: 'О нашем салоне',
  aboutText: '«Мята & Эвкалипт» — это пространство, где забота о вашем теле становится искусством. Мы находимся в самом сердце Казани и предлагаем широкий спектр массажных услуг для восстановления энергии и здоровья.',
  servicesTitle: 'Наши услуги',
  reviewsTitle: 'Отзывы клиентов',
  contactsTitle: 'Контакты',
  address: 'Казань, ул. Чистопольская, 15',
  phone: '+7 (843) 123-45-67',
  email: 'info@myata-eucalypt.ru',
  workHours: 'Пн-Вс: 9:00 — 21:00',
  services: [
    {
      id: 1,
      title: 'Классический массаж',
      description: 'Расслабляющий массаж всего тела с использованием натуральных масел. Снимает напряжение и улучшает кровообращение.',
      price: '3 500 ₽',
      duration: '60 мин',
      icon: '🌿'
    },
    {
      id: 2,
      title: 'Спортивный массаж',
      description: 'Глубокая проработка мышц для восстановления после тренировок. Устраняет зажимы и повышает гибкость.',
      price: '4 200 ₽',
      duration: '60 мин',
      icon: '💪'
    },
    {
      id: 3,
      title: 'SPA-программа',
      description: 'Комплексный уход: ароматерапия, горячие камни, массаж лица и тела. Полное перезагрузка за 90 минут.',
      price: '5 800 ₽',
      duration: '90 мин',
      icon: '✨'
    }
  ],
  reviews: [
    { name: 'Алия М.', text: 'Потрясающий салон! После классического массажа чувствую себя заново рождённой. Мастера — настоящие профессионалы.', rating: 5 },
    { name: 'Рустам К.', text: 'Хожу на спортивный массаж уже полгода. Отличные результаты, мышцы восстанавливаются гораздо быстрее.', rating: 5 },
    { name: 'Елена В.', text: 'SPA-программа — это нечто! Атмосфера, ароматы, профессионализм. Рекомендую всем!', rating: 5 }
  ]
};

export default function App() {
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('salon_content');
    return saved ? JSON.parse(saved) : DEFAULT_CONTENT;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [notification, setNotification] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  // Booking form state
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply admin mode
  useEffect(() => {
    if (isAdmin) {
      setShowAdminPanel(true);
    } else {
      setShowAdminPanel(false);
    }
  }, [isAdmin]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleAdminLogin = () => {
    const password = prompt('Введите пароль для доступа к админ-панели:');
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      showNotification('Режим администратора активирован');
    } else if (password !== null) {
      showNotification('Доступ заблокирован. Неверный пароль.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    showNotification('Вы вышли из режима администратора');
  };

  const handleSaveChanges = () => {
    localStorage.setItem('salon_content', JSON.stringify(content));
    showNotification('Изменения сохранены успешно!');
  };

  const handleTextChange = (field: string, value: string) => {
    setContent((prev: typeof DEFAULT_CONTENT) => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    setContent((prev: typeof DEFAULT_CONTENT) => {
      const newServices = [...prev.services];
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, services: newServices };
    });
  };

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientPhone) {
      showNotification('Пожалуйста, заполните все поля');
      return;
    }
    showNotification('Вы успешно записаны через Planerka.app!');
    setShowBooking(false);
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setClientPhone('');
  };

  const openBooking = (serviceName?: string) => {
    if (serviceName) setSelectedService(serviceName);
    setShowBooking(true);
    setMobileMenuOpen(false);
  };

  // Generate next 7 days
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })
    };
  }), []);

  // Stable availability (some slots are "booked")
  const slotAvailability = [true, true, false, true, true, false, true, true, true, false, true, true];

  const editableClass = isAdmin ? 'admin-editable' : '';
  const editableImageClass = isAdmin ? 'admin-editable-image' : '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-down">
          <div className="px-6 py-3 rounded-lg shadow-lg text-white font-medium" style={{ backgroundColor: 'var(--primary-color)' }}>
            {notification}
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerScrolled ? 'shadow-lg' : ''}`}
        style={{ backgroundColor: headerScrolled ? 'rgba(253, 251, 247, 0.95)' : 'var(--bg-color)', backdropFilter: headerScrolled ? 'blur(10px)' : 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="font-bold text-lg md:text-xl" style={{ color: 'var(--primary-color)' }}>
                Мята & Эвкалипт
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="hover:opacity-70 transition-opacity font-medium">Услуги</a>
              <a href="#about" className="hover:opacity-70 transition-opacity font-medium">О нас</a>
              <a href="#reviews" className="hover:opacity-70 transition-opacity font-medium">Отзывы</a>
              <a href="#contacts" className="hover:opacity-70 transition-opacity font-medium">Контакты</a>
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                onClick={() => openBooking()}
                className="px-6 py-2.5 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Онлайн-запись
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 animate-slide-down">
              <nav className="flex flex-col gap-3">
                <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">Услуги</a>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">О нас</a>
                <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">Отзывы</a>
                <a href="#contacts" onClick={() => setMobileMenuOpen(false)} className="py-2 font-medium">Контакты</a>
                <button
                  onClick={() => openBooking()}
                  className="mt-2 px-6 py-2.5 rounded-full text-white font-semibold w-full"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                >
                  Онлайн-запись
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left content */}
            <div className="animate-fade-in">
              <h1
                contentEditable={isAdmin}
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange('heroTitle', e.currentTarget.textContent || '')}
                className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 ${editableClass}`}
                style={{ color: 'var(--primary-color)' }}
              >
                {content.heroTitle}
              </h1>
              <p
                contentEditable={isAdmin}
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange('heroSubtitle', e.currentTarget.textContent || '')}
                className={`text-lg md:text-xl mb-8 opacity-80 ${editableClass}`}
              >
                {content.heroSubtitle}
              </p>
              <button
                onClick={() => openBooking()}
                className="px-8 py-4 rounded-full text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Записаться онлайн
              </button>
            </div>

            {/* Right image */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className={`aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ${editableImageClass}`}
                onClick={() => {
                  if (isAdmin) {
                    const newUrl = prompt('Введите URL нового изображения:');
                    if (newUrl) {
                      const img = document.querySelector('#hero-image') as HTMLImageElement;
                      if (img) img.src = newUrl;
                    }
                  }
                }}
              >
                <img
                  id="hero-image"
                  src="https://image.qwenlm.ai/generated-images/10e00021-d851-40a6-ae08-5a4b2f14f849/_result.png"
                  alt="Массажный салон Мята & Эвкалипт"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-20"
                style={{ backgroundColor: 'var(--accent-color)' }}></div>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20"
                style={{ backgroundColor: 'var(--primary-color)' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24" style={{ backgroundColor: 'rgba(135, 169, 107, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            contentEditable={isAdmin}
            suppressContentEditableWarning
            onBlur={(e) => handleTextChange('servicesTitle', e.currentTarget.textContent || '')}
            className={`text-3xl md:text-4xl font-bold text-center mb-12 ${editableClass}`}
            style={{ color: 'var(--primary-color)' }}
          >
            {content.servicesTitle}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {content.services.map((service: typeof DEFAULT_CONTENT.services[0], index: number) => (
              <div key={service.id} className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow group">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3
                  contentEditable={isAdmin}
                  suppressContentEditableWarning
                  onBlur={(e) => handleServiceChange(index, 'title', e.currentTarget.textContent || '')}
                  className={`text-xl font-bold mb-3 ${editableClass}`}
                  style={{ color: 'var(--primary-color)' }}
                >
                  {service.title}
                </h3>
                <p
                  contentEditable={isAdmin}
                  suppressContentEditableWarning
                  onBlur={(e) => handleServiceChange(index, 'description', e.currentTarget.textContent || '')}
                  className={`mb-4 opacity-70 ${editableClass}`}
                >
                  {service.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span
                    contentEditable={isAdmin}
                    suppressContentEditableWarning
                    onBlur={(e) => handleServiceChange(index, 'price', e.currentTarget.textContent || '')}
                    className={`text-2xl font-bold ${editableClass}`}
                    style={{ color: 'var(--primary-color)' }}
                  >
                    {service.price}
                  </span>
                  <span
                    contentEditable={isAdmin}
                    suppressContentEditableWarning
                    onBlur={(e) => handleServiceChange(index, 'duration', e.currentTarget.textContent || '')}
                    className={`text-sm opacity-60 ${editableClass}`}
                  >
                    {service.duration}
                  </span>
                </div>
                <button
                  onClick={() => openBooking(service.title)}
                  className="w-full py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--accent-color)' }}
                >
                  Записаться
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className={`aspect-[4/3] rounded-2xl overflow-hidden shadow-xl ${editableImageClass}`}
              onClick={() => {
                if (isAdmin) {
                  const newUrl = prompt('Введите URL нового изображения:');
                  if (newUrl) {
                    const img = document.querySelector('#about-image') as HTMLImageElement;
                    if (img) img.src = newUrl;
                  }
                }
              }}
            >
              <img
                id="about-image"
                src="https://image.qwenlm.ai/generated-images/5d0c6959-f5f3-4717-8f29-5abcac6a612b/_result.png"
                alt="Интерьер салона"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2
                contentEditable={isAdmin}
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange('aboutTitle', e.currentTarget.textContent || '')}
                className={`text-3xl md:text-4xl font-bold mb-6 ${editableClass}`}
                style={{ color: 'var(--primary-color)' }}
              >
                {content.aboutTitle}
              </h2>
              <p
                contentEditable={isAdmin}
                suppressContentEditableWarning
                onBlur={(e) => handleTextChange('aboutText', e.currentTarget.textContent || '')}
                className={`text-lg opacity-80 mb-6 ${editableClass}`}
              >
                {content.aboutText}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(135, 169, 107, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>7+</div>
                  <div className="text-sm opacity-70">лет опыта</div>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(135, 169, 107, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>5000+</div>
                  <div className="text-sm opacity-70">довольных клиентов</div>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(135, 169, 107, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>12</div>
                  <div className="text-sm opacity-70">мастеров</div>
                </div>
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'rgba(135, 169, 107, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>4.9</div>
                  <div className="text-sm opacity-70">рейтинг</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-16 md:py-24" style={{ backgroundColor: 'rgba(135, 169, 107, 0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            contentEditable={isAdmin}
            suppressContentEditableWarning
            onBlur={(e) => handleTextChange('reviewsTitle', e.currentTarget.textContent || '')}
            className={`text-3xl md:text-4xl font-bold text-center mb-12 ${editableClass}`}
            style={{ color: 'var(--primary-color)' }}
          >
            {content.reviewsTitle}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.reviews.map((review: typeof DEFAULT_CONTENT.reviews[0], index: number) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="mb-4 italic opacity-80">"{review.text}"</p>
                <div className="font-semibold" style={{ color: 'var(--primary-color)' }}>{review.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section id="contacts" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            contentEditable={isAdmin}
            suppressContentEditableWarning
            onBlur={(e) => handleTextChange('contactsTitle', e.currentTarget.textContent || '')}
            className={`text-3xl md:text-4xl font-bold text-center mb-12 ${editableClass}`}
            style={{ color: 'var(--primary-color)' }}
          >
            {content.contactsTitle}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-white shadow-md">
              <div className="text-3xl mb-3">📍</div>
              <p contentEditable={isAdmin} suppressContentEditableWarning
                onBlur={(e) => handleTextChange('address', e.currentTarget.textContent || '')}
                className={`font-medium ${editableClass}`}>{content.address}</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-md">
              <div className="text-3xl mb-3">📞</div>
              <p contentEditable={isAdmin} suppressContentEditableWarning
                onBlur={(e) => handleTextChange('phone', e.currentTarget.textContent || '')}
                className={`font-medium ${editableClass}`}>{content.phone}</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-md">
              <div className="text-3xl mb-3">✉️</div>
              <p contentEditable={isAdmin} suppressContentEditableWarning
                onBlur={(e) => handleTextChange('email', e.currentTarget.textContent || '')}
                className={`font-medium ${editableClass}`}>{content.email}</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-md">
              <div className="text-3xl mb-3">🕐</div>
              <p contentEditable={isAdmin} suppressContentEditableWarning
                onBlur={(e) => handleTextChange('workHours', e.currentTarget.textContent || '')}
                className={`font-medium ${editableClass}`}>{content.workHours}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white" style={{ backgroundColor: 'var(--primary-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌿</span>
                <span className="font-bold text-xl">Мята & Эвкалипт</span>
              </div>
              <p className="opacity-70">Массажный салон в центре Казани. Забота о вашем теле — наше искусство.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Навигация</h4>
              <div className="flex flex-col gap-2">
                <a href="#services" className="opacity-70 hover:opacity-100 transition-opacity">Услуги</a>
                <a href="#about" className="opacity-70 hover:opacity-100 transition-opacity">О нас</a>
                <a href="#reviews" className="opacity-70 hover:opacity-100 transition-opacity">Отзывы</a>
                <a href="#contacts" className="opacity-70 hover:opacity-100 transition-opacity">Контакты</a>
              </div>
            </div>

            {/* Social & Contacts */}
            <div>
              <h4 className="font-bold mb-4">Мы в соцсетях</h4>
              <div className="flex gap-4 mb-4">
                {/* Telegram */}
                <a href="https://t.me/myata_eucalypt" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                {/* VK */}
                <a href="https://vk.com/myata_eucalypt" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                  </svg>
                </a>
                {/* WhatsApp */}
                <a href="https://wa.me/78431234567" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
              <p className="opacity-70 text-sm">
                <span contentEditable={isAdmin} suppressContentEditableWarning
                  onBlur={(e) => handleTextChange('address', e.currentTarget.textContent || '')}
                  className={editableClass}>{content.address}</span>
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="opacity-60 text-sm">© 2024 Мята & Эвкалипт. Все права защищены.</p>
            <button
              onClick={handleAdminLogin}
              className="opacity-40 hover:opacity-80 transition-opacity text-xs cursor-pointer"
            >
              Для персонала
            </button>
          </div>
        </div>
      </footer>

      {/* Booking Modal (Planerka.app) */}
      {showBooking && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={() => setShowBooking(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--primary-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm font-bold">P</div>
                <div>
                  <h3 className="text-white font-bold">Planerka.app</h3>
                  <p className="text-white/70 text-xs">Онлайн-запись</p>
                </div>
              </div>
              <button onClick={() => setShowBooking(false)} className="text-white/70 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Step 1: Service */}
              <div className="mb-6">
                <label className="block font-semibold mb-2" style={{ color: 'var(--primary-color)' }}>
                  1. Выберите услугу
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 focus:outline-none focus:border-[#87A96B]"
                  style={{ borderColor: 'var(--accent-color)' }}
                >
                  <option value="">— Выберите —</option>
                  {content.services.map((s: typeof DEFAULT_CONTENT.services[0]) => (
                    <option key={s.id} value={s.title}>{s.title} — {s.price}</option>
                  ))}
                </select>
              </div>

              {/* Step 2: Date */}
              <div className="mb-6">
                <label className="block font-semibold mb-2" style={{ color: 'var(--primary-color)' }}>
                  2. Выберите дату
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap font-medium transition-colors ${
                        selectedDate === date.value
                          ? 'text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      style={selectedDate === date.value ? { backgroundColor: 'var(--primary-color)' } : {}}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Time */}
              <div className="mb-6">
                <label className="block font-semibold mb-2" style={{ color: 'var(--primary-color)' }}>
                  3. Доступное время
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((time: string, index: number) => {
                    const isAvailable = slotAvailability[index];
                    return (
                      <button
                        key={time}
                        onClick={() => isAvailable && setSelectedTime(time)}
                        disabled={!isAvailable}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          !isAvailable
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                            : selectedTime === time
                            ? 'text-white'
                            : 'bg-green-50 hover:bg-green-100 text-green-800'
                        }`}
                        style={selectedTime === time ? { backgroundColor: 'var(--primary-color)' } : {}}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Phone */}
              <div className="mb-6">
                <label className="block font-semibold mb-2" style={{ color: 'var(--primary-color)' }}>
                  4. Ваш телефон
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full p-3 rounded-xl border-2 focus:outline-none focus:border-[#87A96B]"
                  style={{ borderColor: 'var(--accent-color)' }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleBooking}
                className="w-full py-4 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Подтвердить запись
              </button>

              <p className="text-center text-xs opacity-50 mt-3">
                Работает на Planerka.app — сервис онлайн-записи
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Floating Panel */}
      {showAdminPanel && isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 z-[80] animate-slide-down">
          <div className="bg-white shadow-2xl border-t-2 px-4 py-3 flex items-center justify-between"
            style={{ borderColor: 'var(--primary-color)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-semibold text-sm" style={{ color: 'var(--primary-color)' }}>
                Режим администратора
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 rounded-lg text-white font-medium text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                💾 Сохранить изменения
              </button>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 rounded-lg font-medium text-sm border-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
