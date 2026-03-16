import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <div className="bg-white dark:bg-background-dark text-slate-800 dark:text-slate-100 font-display min-h-screen">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="bg-primary text-white p-2 rounded-lg">
                <span className="material-icons-round text-2xl">pets</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                PetFriend Connect
              </span>
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#como-funciona"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Como funciona
              </a>
              <Link
                to="/registro"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Para Cuidadores
              </Link>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/registro"
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-blue-700 rounded-full transition-all shadow-lg shadow-primary/20"
              >
                Registrar
              </Link>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={dark ? "Modo claro" : "Modo escuro"}
              >
                <span className="material-icons-round text-xl">
                  {dark ? "light_mode" : "dark_mode"}
                </span>
              </button>
            </nav>

            {/* Mobile: menu + toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-icons-round text-xl">
                  {dark ? "light_mode" : "dark_mode"}
                </span>
              </button>
              <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-icons-round">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute top-[20%] right-[0%] w-[40%] h-[60%] rounded-full bg-orange-400/5 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Texto */}
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold mb-6 border border-green-500/20">
                  <span className="material-icons-round text-sm">
                    verified_user
                  </span>
                  Plataforma #1 de Cuidadores
                </div>

                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                  Encontre o cuidador{" "}
                  <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                    perfeito
                  </span>{" "}
                  para seu pet.
                </h1>

                <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-lg">
                  Conectamos donos amorosos a cuidadores locais de confiança.
                  Passeios, hospedagem e muito carinho para quem você mais ama.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-4 text-base font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xl shadow-orange-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                    <span className="material-icons-round">search</span>
                    Encontrar Cuidador
                  </button>
                  <Link
                    to="/registro"
                    className="px-8 py-4 text-base font-bold text-primary bg-transparent border-2 border-primary/20 hover:border-primary hover:bg-primary/5 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Quero ser Cuidador
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-round text-green-500">
                      check_circle
                    </span>
                    Identidade verificada
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-icons-round text-green-500">
                      check_circle
                    </span>
                    Seguro veterinário
                  </div>
                </div>
              </div>

              {/* Imagem */}
              <div className="relative lg:h-[600px] flex items-center justify-center">
                <div className="relative w-full h-full max-w-lg mx-auto">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 z-10">
                    <img
                      src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2500&auto=format&fit=crop"
                      alt="Cachorro feliz com cuidador no parque"
                      className="object-cover w-full h-[500px]"
                    />
                  </div>
                  <div
                    className="absolute -bottom-6 -left-6 z-20 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-bounce"
                    style={{ animationDuration: "3s" }}
                  >
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                      <span className="material-icons-round text-yellow-500">
                        star
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        4.9/5
                      </p>
                      <p className="text-xs text-slate-500">Avaliação Média</p>
                    </div>
                  </div>
                  <div className="absolute top-10 -right-6 z-20 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <span className="material-icons-round text-primary">
                        favorite
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        10k+
                      </p>
                      <p className="text-xs text-slate-500">Pets Felizes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section
          id="como-funciona"
          className="py-20 bg-slate-50 dark:bg-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Como funciona o PetFriend
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Em poucos passos, garantimos que seu melhor amigo receba o
                cuidado que merece.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  num: "1",
                  icon: "pets",
                  title: "Cadastre seu pet",
                  desc: "Crie um perfil detalhado com as necessidades, preferências e rotina do seu animalzinho.",
                },
                {
                  num: "2",
                  icon: "map",
                  title: "Encontre cuidadores",
                  desc: "Navegue por perfis de cuidadores próximos, leia avaliações e escolha o ideal.",
                },
                {
                  num: "3",
                  icon: "verified_user",
                  title: "Reserva segura",
                  desc: "Agende, pague com segurança pela plataforma e receba atualizações em tempo real.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="relative group p-8 rounded-2xl bg-white dark:bg-slate-800 hover:border-primary/20 border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 p-4 text-slate-200 dark:text-slate-700 font-bold text-6xl opacity-30 select-none">
                    {step.num}
                  </div>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                    <span className="material-icons-round text-3xl">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section className="py-20 bg-white dark:bg-background-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Nossos Serviços
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Tudo o que você precisa para o bem-estar do seu pet.
                </p>
              </div>
              <a
                href="#"
                className="text-primary font-medium hover:text-blue-700 flex items-center gap-1"
              >
                Ver todos{" "}
                <span className="material-icons-round text-sm">
                  arrow_forward
                </span>
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "directions_walk",
                  color: "bg-blue-100 dark:bg-blue-900/30 text-primary",
                  title: "Passeios",
                  desc: "Exercício e diversão para gastar energia.",
                  badge: "Popular",
                },
                {
                  icon: "home",
                  color: "bg-green-100 dark:bg-green-900/30 text-green-600",
                  title: "Hospedagem",
                  desc: "Um lar seguro para quando você viajar.",
                },
                {
                  icon: "wb_sunny",
                  color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
                  title: "Creche (Day Care)",
                  desc: "Socialização e cuidados durante o dia.",
                },
                {
                  icon: "medical_services",
                  color: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
                  title: "Cuidados Especiais",
                  desc: "Atenção extra para pets idosos ou em recuperação.",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${s.color}`}
                  >
                    <span className="material-icons-round">{s.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {s.desc}
                  </p>
                  {s.badge && (
                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                      {s.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-slate-50 dark:bg-background-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-primary rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-primary opacity-90 z-10" />
              <div className="relative z-20 px-8 py-16 md:py-20 md:px-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Pronto para encontrar o melhor amigo do seu pet?
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Junte-se a milhares de donos felizes. O cadastro é rápido e
                    gratuito.
                  </p>
                </div>
                <Link
                  to="/registro"
                  className="flex-shrink-0 px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors transform hover:scale-105"
                >
                  Começar Agora
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-white p-1.5 rounded-lg">
                  <span className="material-icons-round text-xl">pets</span>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  PetFriend Connect
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm">
                Conectando corações e patas desde 2023.
              </p>
              <div className="flex gap-4">
                {["facebook", "camera_alt", "alternate_email"].map((icon) => (
                  <a
                    key={icon}
                    href="#"
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors"
                  >
                    <span className="material-icons-round text-lg">{icon}</span>
                  </a>
                ))}
              </div>
            </div>
            {[
              {
                title: "Empresa",
                links: ["Sobre nós", "Carreiras", "Blog", "Imprensa"],
              },
              {
                title: "Serviços",
                links: ["Passeios", "Hospedagem", "Creche", "Veterinários"],
              },
              {
                title: "Suporte",
                links: [
                  "Central de Ajuda",
                  "Termos de Uso",
                  "Privacidade",
                  "Fale Conosco",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="hover:text-primary transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>© 2023 PetFriend Connect. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
