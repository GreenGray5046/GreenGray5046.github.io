'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { calculatorMap, searchCalculators, getCalculatorsByCategory, allCalculators } from '@/lib/calculators/registry';
import { CalcField, CalcResult, Calculator, Category, categories } from '@/lib/calc-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Calculator as CalcIcon, Lock, DollarSign, Heart, ArrowLeftRight, Atom, FlaskConical, Cpu, Home, Type, Palette, Globe,
  Search, ArrowLeft, ChevronRight, Sparkles, X, Menu, ChevronDown
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Calculator: CalcIcon, Lock, DollarSign, Heart, ArrowLeftRight, Atom, FlaskConical, Cpu, Home, Type, Palette, Globe,
};

type View = 'home' | 'category' | 'calculator' | 'search';

interface NavState {
  view: View;
  categoryId?: string;
  calcId?: string;
  searchQuery?: string;
}

function parseHash(hash: string): NavState {
  if (!hash || hash === '#/' || hash === '#') return { view: 'home' };
  const parts = hash.replace('#/', '').split('/');
  if (parts[0] === 'search') return { view: 'search', searchQuery: decodeURIComponent(parts[1] || '') };
  if (parts.length === 1) return { view: 'category', categoryId: parts[0] };
  if (parts.length >= 2) return { view: 'calculator', categoryId: parts[0], calcId: parts[1] };
  return { view: 'home' };
}

function AdBanner({ slot = 'top', className = '' }: { slot?: string; className?: string }) {
  return (
    <div className={`bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center text-xs text-muted-foreground/50 ${slot === 'sidebar' ? 'min-h-[250px] w-full' : slot === 'footer' ? 'min-h-[90px] w-full' : 'min-h-[90px] w-full'} ${className}`}>
      <span>Ad Space</span>
    </div>
  );
}

function FieldRenderer({ field, value, onChange }: { field: CalcField; value: string | number | boolean; onChange: (v: string | number | boolean) => void }) {
  switch (field.type) {
    case 'number':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={field.id} className="text-sm font-medium">{field.label}</Label>
          <div className="flex items-center gap-2">
            {field.prefix && <span className="text-sm text-muted-foreground">{field.prefix}</span>}
            <Input
              id={field.id}
              type="number"
              value={value as number}
              onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              className="h-9"
            />
            {field.suffix && <span className="text-sm text-muted-foreground whitespace-nowrap">{field.suffix}</span>}
          </div>
        </div>
      );
    case 'text':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={field.id} className="text-sm font-medium">{field.label}</Label>
          <Input
            id={field.id}
            type="text"
            value={value as string}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="h-9"
          />
        </div>
      );
    case 'textarea':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={field.id} className="text-sm font-medium">{field.label}</Label>
          <Textarea
            id={field.id}
            value={value as string}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className="font-mono text-sm"
          />
        </div>
      );
    case 'select':
      return (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{field.label}</Label>
          <Select value={String(value)} onValueChange={v => onChange(v)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {field.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      );
    case 'checkbox':
      return (
        <div className="flex items-center gap-2 pt-5">
          <Checkbox id={field.id} checked={value as boolean} onCheckedChange={v => onChange(!!v)} />
          <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer">{field.label}</Label>
        </div>
      );
    case 'color':
      return (
        <div className="space-y-1.5">
          <Label htmlFor={field.id} className="text-sm font-medium">{field.label}</Label>
          <div className="flex items-center gap-2">
            <input type="color" id={field.id} value={value as string} onChange={e => onChange(e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
            <Input value={value as string} onChange={e => onChange(e.target.value)} className="h-9 font-mono text-sm" placeholder="#000000" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

function CalculatorView({ calc }: { calc: Calculator }) {
  const defaultInputs = useMemo(() => {
    const defaults: Record<string, string | number | boolean> = {};
    calc.fields.forEach(f => {
      if (f.default !== undefined) defaults[f.id] = f.default;
      else if (f.type === 'number') defaults[f.id] = '';
      else if (f.type === 'checkbox') defaults[f.id] = false;
      else if (f.type === 'color') defaults[f.id] = '#000000';
      else defaults[f.id] = '';
    });
    return defaults;
  }, [calc.id, calc.fields]);

  const [inputs, setInputs] = useState<Record<string, string | number | boolean>>(defaultInputs);
  const [results, setResults] = useState<CalcResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset state when calculator changes
  const [prevCalcId, setPrevCalcId] = useState(calc.id);
  if (prevCalcId !== calc.id) {
    setPrevCalcId(calc.id);
    setInputs(defaultInputs);
    setResults(null);
    setError(null);
  }

  const handleCalculate = useCallback(() => {
    try {
      const r = calc.compute(inputs);
      setResults(r);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Calculation error');
      setResults(null);
    }
  }, [calc, inputs]);

  const handleInputChange = useCallback((fieldId: string, value: string | number | boolean) => {
    setInputs(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{calc.name}</h1>
        <p className="text-muted-foreground mt-1">{calc.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {calc.keywords.slice(0, 5).map(k => (
            <Badge key={k} variant="secondary" className="text-xs font-normal">{k}</Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {calc.fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={inputs[field.id] ?? ''}
                  onChange={v => handleInputChange(field.id, v)}
                />
              ))}
              <Button onClick={handleCalculate} className="w-full h-10 text-sm font-semibold" size="default">
                <Sparkles className="w-4 h-4 mr-2" /> Calculate
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {results && results.length > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className={`flex justify-between items-center py-1.5 px-3 rounded-md ${r.highlight ? 'bg-emerald-100/60 font-semibold' : 'bg-background'}`}>
                      <span className="text-sm text-muted-foreground">{r.label}</span>
                      <span className={`text-sm font-mono ${r.highlight ? 'text-emerald-700 text-base' : ''}`}>{String(r.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <AdBanner slot="between" className="lg:hidden" />
        </div>

        <div className="space-y-4 hidden lg:block">
          <AdBanner slot="sidebar" />
        </div>
      </div>
    </div>
  );
}

function CategoryView({ categoryId, onSelectCalc }: { categoryId: string; onSelectCalc: (id: string) => void }) {
  const category = categories.find(c => c.id === categoryId);
  const calcs = useMemo(() => getCalculatorsByCategory(categoryId), [categoryId]);

  if (!category) return <div>Category not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
        <p className="text-muted-foreground mt-1">{category.description}</p>
        <Badge variant="outline" className="mt-2">{calcs.length} calculators</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {calcs.map(calc => (
          <button
            key={calc.id}
            onClick={() => onSelectCalc(calc.id)}
            className="text-left p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-accent transition-colors duration-150 group"
          >
            <div className="font-medium text-sm group-hover:text-primary transition-colors">{calc.name}</div>
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{calc.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HomeView({ onSelectCategory, onSelectCalc }: { onSelectCategory: (id: string) => void; onSelectCalc: (id: string) => void }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 py-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Free Online <span className="text-primary">Calculators</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          {allCalculators.length}+ free calculators for math, finance, science, ciphers, and everyday life. Fast, simple, no signup required.
        </p>
      </div>

      <AdBanner slot="top" />

      {/* Popular / Featured */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Popular Calculators</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {['integral-calculator', 'caesar-cipher-decoder', 'mortgage-calculator', 'bmi-calculator', 'quadratic-equation-solver', 'laplace-transform-calculator',
            'vigenere-cipher-decoder', 'compound-interest-calculator', 'length-converter', 'ph-calculator', 'resistor-color-code', 'age-calculator',
            'derivative-calculator', 'base64-encoder', 'retirement-calculator', 'calorie-calculator', 'normal-distribution', 'md5-hash-generator',
            'word-counter', 'color-converter', 'percentage-calculator', 'scientific-calculator', 'tip-calculator', 'fuel-cost-calculator'
          ].filter(id => calculatorMap.has(id)).map(id => {
            const calc = calculatorMap.get(id)!;
            return (
              <button
                key={id}
                onClick={() => onSelectCalc(id)}
                className="text-left p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-colors duration-150"
              >
                <div className="font-medium text-xs sm:text-sm truncate">{calc.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{calc.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-3">All Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map(cat => {
            const Icon = iconMap[cat.icon] || CalcIcon;
            const count = getCalculatorsByCategory(cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`text-left p-4 rounded-lg border transition-colors duration-150 hover:shadow-sm ${cat.color} hover:opacity-90`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{cat.name}</div>
                    <div className="text-xs opacity-70 mt-0.5">{count} calculators · {cat.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* All calculators list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">All Calculators A-Z</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)} className="text-xs">
            {showAll ? 'Show Less' : `Show All (${allCalculators.length})`}
            <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1.5 ${!showAll ? 'max-h-64 overflow-hidden relative' : ''}`}>
          {allCalculators.sort((a, b) => a.name.localeCompare(b.name)).map(calc => (
            <button
              key={calc.id}
              onClick={() => onSelectCalc(calc.id)}
              className="text-left px-3 py-2 rounded-md text-xs hover:bg-accent/50 transition-colors truncate"
            >
              {calc.name}
            </button>
          ))}
          {!showAll && <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />}
        </div>
      </div>

      <AdBanner slot="footer" />
    </div>
  );
}

function SearchResults({ query, onSelectCalc }: { query: string; onSelectCalc: (id: string) => void }) {
  const results = useMemo(() => searchCalculators(query), [query]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </h2>
      {results.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No calculators found. Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {results.map(calc => (
            <button
              key={calc.id}
              onClick={() => onSelectCalc(calc.id)}
              className="text-left p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-accent transition-colors duration-150"
            >
              <div className="font-medium text-sm">{calc.name}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{calc.description}</div>
              <Badge variant="outline" className="mt-2 text-[10px]">{calc.category}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CalculatorApp() {
  const [nav, setNav] = useState<NavState>({ view: 'home' });
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleHash = () => {
      const state = parseHash(window.location.hash);
      setNav(state);
      if (state.view === 'search' && state.searchQuery) {
        setSearchQuery(state.searchQuery);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = useCallback((hash: string) => {
    window.location.hash = hash;
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`#/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  const handleSelectCategory = useCallback((id: string) => {
    navigate(`#/${id}`);
  }, [navigate]);

  const handleSelectCalc = useCallback((id: string) => {
    const calc = calculatorMap.get(id);
    if (calc) navigate(`#/${calc.category}/${id}`);
  }, [navigate]);

  const handleBack = useCallback(() => {
    if (nav.view === 'calculator' && nav.categoryId) {
      navigate(`#/${nav.categoryId}`);
    } else {
      navigate('#/');
    }
  }, [nav, navigate]);

  const currentCalc = nav.calcId ? calculatorMap.get(nav.calcId) : undefined;
  const currentCategory = nav.categoryId ? categories.find(c => c.id === nav.categoryId) : undefined;

  const breadcrumbs = useMemo(() => {
    const items: { label: string; href: string }[] = [{ label: 'Home', href: '#/' }];
    if (nav.categoryId && currentCategory) {
      items.push({ label: currentCategory.name, href: `#/${nav.categoryId}` });
    }
    if (nav.calcId && currentCalc) {
      items.push({ label: currentCalc.name, href: `#/${nav.categoryId}/${nav.calcId}` });
    }
    if (nav.view === 'search' && nav.searchQuery) {
      items.push({ label: `Search: ${nav.searchQuery}`, href: `#/search/${encodeURIComponent(nav.searchQuery)}` });
    }
    return items;
  }, [nav, currentCategory, currentCalc]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('#/')} className="font-bold text-lg tracking-tight flex items-center gap-1.5 hover:opacity-80 transition-opacity flex-shrink-0">
            <CalcIcon className="w-5 h-5 text-primary" />
            <span className="hidden sm:inline">CalcHub</span>
          </button>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search calculators..."
                className="pl-8 h-9 text-sm bg-muted/30"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((b, i) => (
              <span key={b.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {i < breadcrumbs.length - 1 ? (
                  <button onClick={() => navigate(b.href)} className="hover:text-foreground transition-colors">{b.label}</button>
                ) : (
                  <span className="text-foreground font-medium truncate max-w-[200px]">{b.label}</span>
                )}
              </span>
            ))}
          </nav>

          {nav.view !== 'home' && (
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 text-xs flex-shrink-0">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {nav.view === 'home' && (
          <HomeView onSelectCategory={handleSelectCategory} onSelectCalc={handleSelectCalc} />
        )}
        {nav.view === 'category' && nav.categoryId && (
          <CategoryView categoryId={nav.categoryId} onSelectCalc={handleSelectCalc} />
        )}
        {nav.view === 'calculator' && currentCalc && (
          <CalculatorView calc={currentCalc} />
        )}
        {nav.view === 'search' && nav.searchQuery && (
          <SearchResults query={nav.searchQuery} onSelectCalc={handleSelectCalc} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <AdBanner slot="footer" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalcIcon className="w-4 h-4" />
              <span className="font-semibold">CalcHub</span>
              <span>— {allCalculators.length}+ Free Online Calculators</span>
            </div>
            <div>All calculations are for educational purposes. Verify important results independently.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
