import { 
    Cpu, Server, Terminal, Database, ShieldCheck, Globe, Zap, Layout, Smartphone 
  } from 'lucide-react';
  import { apex } from '@/lib/apexkit';
import { AppRecord } from '@apexkit/sdk';
  
  // Icon Mapping
  const Icons: Record<string, any> = {
    Cpu, Server, Terminal, Database, ShieldCheck, Globe, Zap, Layout, Smartphone
  };
  
  export function FeatureGrid({ features }: { features: AppRecord[] }) {
    return (
      <section>
          <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why ApexKit?</h2>
              <p className="text-muted max-w-2xl mx-auto">Engineered for developers who demand raw performance without the operational complexity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.length > 0 ? (
                  features.map(item => {
                      const IconComponent = Icons[item.data.icon] || Cpu;
                      const colorClass = item.data.color || "text-primary";
                      
                      return (
                          <div key={item.id} className="p-6 rounded-2xl bg-surface/50 border border-border hover:border-primary/50 hover:bg-surface transition-all group duration-300 hover:-translate-y-1">
                              <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 ${colorClass} group-hover:scale-110 transition-transform shadow-inner border border-border`}>
                                  <IconComponent size={24} />
                              </div>
                              <h3 className="text-xl font-bold text-foreground mb-2">{item.data.title}</h3>
                              <p className="text-muted leading-relaxed text-sm">{item.data.description}</p>
                          </div>
                      );
                  })
              ) : (
                  <div className="col-span-3 text-center text-muted italic">No features found.</div>
              )}
          </div>
      </section>
    );
  }