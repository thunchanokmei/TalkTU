export const GENDER_IDENTITY_MAP = {
    Man: 'man',
    Woman: 'woman',
    Lesbian: 'lesbian',
    Gay: 'gay',
    Bisexual: 'bisexual',
    Transgender: 'transgender',
    Queer: 'queer',
    Intersex: 'intersex',
    Asexual: 'asexual',
} as const;

export type GenderIdentityLabel =
    keyof typeof GENDER_IDENTITY_MAP;

export const GENDER_IDENTITY_OPTIONS: GenderIdentityLabel[] = [
    'Man',
    'Woman',
    'Lesbian',
    'Gay',
    'Bisexual',
    'Transgender',
    'Queer',
    'Intersex',
    'Asexual',
];