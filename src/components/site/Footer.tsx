import Link from 'next/link';
import { Icon } from './Icons';
import { Wordmark } from './Brand';

export function Footer() {
  return (
    <footer className="hero-ground grain relative mt-28 text-white">
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-12 border-b border-white/10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/55">
              Outstation cabs with a driver, at a fare agreed before you travel.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-accent">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon.star key={i} className="h-3.5 w-3.5" />
              ))}
              <span className="ml-1.5 text-[13px] font-semibold text-white/70">4.8 / 5</span>
            </div>
          </div>

          <FooterCol
            title="Travel"
            links={[
              ['One-way cabs', '/#book'],
              ['Round trips', '/#book'],
              ['Hourly rentals', '/#book'],
              ['Popular routes', '/#routes'],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ['How it works', '/#how'],
              ['Our fleet', '/#fleet'],
              ['Drive with us', 'https://play.google.com/store/apps/details?id=com.hellomycab.hello_my_cab_app'],
            ]}
          />

          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/40">
              Talk to us
            </h3>
            <p className="mt-4 text-[15px] text-white/55">Every day, around the clock</p>
            <a
              href="tel:+919667111921"
              className="mt-1.5 block text-2xl font-black tracking-tight transition-colors hover:text-accent"
            >
              +91 96671 11921
            </a>
          </div>
        </div>

        <p className="py-6 text-[13px] text-white/35">
          © {new Date().getFullYear()} Hello My Cab. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-[13px] font-bold uppercase tracking-wider text-white/40">{title}</h3>
      <ul className="mt-4 flex flex-col gap-2.5 text-[15px] text-white/55">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="transition-colors hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
