import "./chunk-3OV72XIM.js";

// node_modules/@angular/common/locales/es-PE.js
var u = void 0;
function plural(val) {
  const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, "").length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, "$2")) || 0;
  if (n === 1) return 1;
  if (e === 0 && !(i === 0) && i % 1e6 === 0 && v === 0 || !(e >= 0 && e <= 5)) return 4;
  return 5;
}
var es_PE_default = ["es-PE", [["a. m.", "p. m."], u, u], u, [["d", "l", "m", "m", "j", "v", "s"], ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"], ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], ["DO", "LU", "MA", "MI", "JU", "VI", "SA"]], [["D", "L", "M", "M", "J", "V", "S"], ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"], ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"], ["DO", "LU", "MA", "MI", "JU", "VI", "SA"]], [["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "set.", "oct.", "nov.", "dic."], ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"]], [["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Set.", "Oct.", "Nov.", "Dic."], ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"]], [["a. C.", "d. C."], u, ["antes de Cristo", "después de Cristo"]], 0, [6, 0], ["d/MM/yy", "d MMM y", "d 'de' MMMM 'de' y", "EEEE, d 'de' MMMM 'de' y"], ["HH:mm", "HH:mm:ss", "HH:mm:ss z", "HH:mm:ss zzzz"], ["{1}, {0}", "{1} {0}", "{1}, {0}", u], [".", ",", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", ":"], ["#,##0.###", "#,##0 %", "¤ #,##0.00", "#E0"], "PEN", "S/", "sol peruano", {
  "AUD": [u, "$"],
  "BRL": [u, "R$"],
  "BYN": [u, "р."],
  "CAD": [u, "$"],
  "CNY": [u, "¥"],
  "ESP": ["₧"],
  "EUR": [u, "€"],
  "FKP": [u, "FK£"],
  "GBP": [u, "£"],
  "HKD": [u, "$"],
  "ILS": [u, "₪"],
  "INR": [u, "₹"],
  "JPY": [u, "¥"],
  "KRW": [u, "₩"],
  "MXN": [u, "$"],
  "NZD": [u, "$"],
  "PEN": ["S/"],
  "PHP": [u, "₱"],
  "RON": [u, "L"],
  "SSP": [u, "SD£"],
  "SYP": [u, "S£"],
  "TWD": [u, "NT$"],
  "USD": [u, "$"],
  "VEF": [u, "BsF"],
  "VND": [u, "₫"],
  "XAF": [],
  "XCD": [u, "$"],
  "XOF": []
}, "ltr", plural];
export {
  es_PE_default as default
};
/*! Bundled license information:

@angular/common/locales/es-PE.js:
  (**
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.dev/license
   *)
*/
//# sourceMappingURL=@angular_common_locales_es-PE.js.map
