/**
 * Utilidad para verificar si una persona es mayor de edad basada en su fecha de nacimiento
 * @param birthDateStr Fecha de nacimiento en formato string (YYYY-MM-DD)
 * @param minAge Edad mínima para considerarse adulto (por defecto 18)
 * @returns true si la persona tiene al menos la edad mínima especificada
 */
export function isAdult(birthDateStr: string, minAge: number = 18): boolean {
    if (!birthDateStr) {
      return false;
    }
    
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= minAge;
  }