import { describe, expect, it } from 'vitest';
import { buildQueryThemeGroups } from './query-theme-groups';

describe('buildQueryThemeGroups', () => {
  it('groups repeated Spanish veterinary appearances into readable themes', () => {
    const prompts = [
      'mejor Servicios veterinarios, desde consulta general, especializada, exámenes complementarios, hospitalización, farmacia, in Temuco',
      'mejor Servicios veterinarios, desde consulta general, especializada, exámenes complementarios, hospitalización, farmacia, in Temuco',
      'Servicios veterinarios, desde consulta general, especializada, exámenes complementarios, hospitalización, farmacia, in Temuco',
      'Servicios veterinarios, desde consulta general, especializada, exámenes complementarios, hospitalización, farmacia, in Temuco',
      'tengo un problema con Servicios veterinarios, desde consulta general, especializada, exámenes complementarios, hospitalización, farmacia, y necesito una solución confiable in Temuco',
      'tengo un problema con Servicios veterinarios, desde consulta general, especializada, exámenes complementarios, hospitalización, farmacia, y necesito una solución confiable in Temuco',
      'is Clínica Veterinaria San Isidro reputable',
      'is Clínica Veterinaria San Isidro reputable',
      'is Clínica Veterinaria San Isidro reputable',
      'Clínica Veterinaria San Isidro Temuco',
      'Clínica Veterinaria San Isidro Temuco',
      'Clínica Veterinaria San Isidro Temuco',
    ];

    const groups = buildQueryThemeGroups(prompts, {
      businessName: 'Clínica Veterinaria San Isidro',
      location: 'Temuco',
      nicheLabel: 'Servicios veterinarios',
    });

    expect(groups).toHaveLength(4);
    expect(groups.map((g) => [g.label, g.count])).toEqual([
      ['Servicios y categoría local', 4],
      ['Reputación y confianza', 3],
      ['Búsquedas directas de marca', 3],
      ['Necesidad confiable / urgente', 2],
    ]);
    expect(groups[0].example).toContain('clínicas veterinarias en Temuco');
    expect(groups.find((g) => g.key === 'brand')?.example).toBe('Clínica Veterinaria San Isidro Temuco');
  });
});
