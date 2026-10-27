import * as fs from 'fs';
import * as path from 'path';
import { analizarCruceRuaaEpa } from '../analyze';

const fixturesDir = path.join(__dirname, 'fixtures');

describe('analizarCruceRuaaEpa', () => {
  it('calcula sobre-recaudación cuando EPA activo y RUAA cancelado', () => {
    const ruaa = fs.readFileSync(path.join(fixturesDir, 'ruaa-mini.csv'), 'utf8');
    const epaHeader = `,,,,,
"Fecha de Registro","Cuenta de Usuario","Tipo de contrato","Identificación Cédula / Ruc","Razón Social","Estado Contrato","Fecha de registro de la cuenta","Fecha de Inicio de Facturación","Fecha de Solicitud Histórico","Fecha de de Baja","Fecha de Resolución","Tipo de Facturación","Observaciones","Observaciones de baja","Email para facturar","Email del cliente","Teléfono fijo","Teléfono celular","Código Único","Provincia en registrada en el contrato","Canton en registrada en el contrato","Parroquia en registrada en el contrato","Planificación","Dirección1 en registrada en el contrato","Dirección2 en registrada en el contrato","Dirección3 en registrada en el contrato","Dirección4 en registrada en el contrato","Dirección extendida registrada en el contrato","Funcionario Registró Cuenta","Usuario que modificó la cuenta","Punto de Suministro","Latitud","Longitud","Zona","Demarcación","Provincia en registrada en el punto de suministro","Canton en registrada en el punto de suministro","Parroquia en registrada en el punto de suministro","Direccion1 en registrada en el punto de suministro","Direccion2 en registrada en el punto de suministro","Direccion3 en registrada en el punto de suministro","Direccion4 en registrada en el punto de suministro","Dirección extendida registrada en el punto de suministro","Caudal Aplicable","Caudal Fijo","Fecha de alta del punto de suministro","Fecha de baja del punto de suministro","Excluido de facturación por Catastro","Excluido de facturación Manual","Excluido de facturación Periódica"
2024-06-18T00:00:00Z,0034752,RIEGO,0992648325001,MERCAGRO S.A.,Activo,2024-06-18,2020-01-01,2024-06-18,,,N010 - Nacionales Riego Productivo,,,a@b.com,a@b.com,,,MA-CH-000005-366810,MANABI,EL CARMEN,EL CARMEN,NACIONAL,DIR,,,,,User Import,,34882,0,0,CHONE,DZ4,,,,,,,,,5.9200,5.9200,2024-06-18,,,,
2016-09-09T00:00:00Z,0022775,TURISMO,1712347937001,KLEVER DUEÑAS,Activo,2016-09-09,2016-09-09,2016-09-09,,,N002 - Nacionales Turismo,,,a@b.com,a@b.com,,,MA-PD-000006-128507,MANABI,PEDERNALES,PEDERNALES,NACIONAL,DIR,,,,,User Import,,22775,0,0,PEDERNALES,DZ4,,,,,,,,,0.1700,0.1700,2016-09-09,,,,
`;

    const result = analizarCruceRuaaEpa(ruaa, epaHeader);
    expect(result.resumen.totalFilasEpa).toBe(2);
    expect(result.resumen.filasConCruce).toBe(2);

    const mercagro = result.filas.find((f) => f.cuentaUsuario === '0034752');
    expect(mercagro?.estadoTramiteRuaa).toBe('VIGENTE');
    expect(mercagro?.debeCobrar).toBe(true);
    expect(mercagro?.montoTeoricoAnualCentavos).toBe(1494);

    const turismo = result.filas.find((f) => f.cuentaUsuario === '0022775');
    expect(turismo?.montoTeoricoAnualCentavos).toBe(8739);
    expect(turismo?.debeCobrar).toBe(true);
  });

  it('RENOVADO en RUAA cuenta como cobrable', () => {
    const ruaa = fs.readFileSync(path.join(fixturesDir, 'ruaa-mini.csv'), 'utf8');
    const ruaaRenovado =
      ruaa +
      '\n999003|MA-PO-000467-373168|MA-PO-000467-2025|MANABI|PORTOVIEJO|RV|2025|2025-06-23|2026-09-08|467|""|1301762264|FARFAN ALONZO|DIR|099|a@b.com|""|PERSONAS|PARTICULAR|""|516245|9880190|304|MANABI|MANTA|MANTA|SITIO|COSTA|RURAL|JIPIJAPA|RIO|RIO|RIO|15139|RIO|RIO|""|INDUSTRIAL|VENTA DE AGUA|0|0|0|0|0|0|""|0|0|""|""|0|0|2,6000|81993,600|T||RENOVADO|""\n';
    const epaRow = `,,,,,
"Fecha de Registro","Cuenta de Usuario","Tipo de contrato","Identificación Cédula / Ruc","Razón Social","Estado Contrato","Fecha de registro de la cuenta","Fecha de Inicio de Facturación","Fecha de Solicitud Histórico","Fecha de de Baja","Fecha de Resolución","Tipo de Facturación","Observaciones","Observaciones de baja","Email para facturar","Email del cliente","Teléfono fijo","Teléfono celular","Código Único","Provincia en registrada en el contrato","Canton en registrada en el contrato","Parroquia en registrada en el contrato","Planificación","Dirección1 en registrada en el contrato","Dirección2 en registrada en el contrato","Dirección3 en registrada en el contrato","Dirección4 en registrada en el contrato","Dirección extendida registrada en el contrato","Funcionario Registró Cuenta","Usuario que modificó la cuenta","Punto de Suministro","Latitud","Longitud","Zona","Demarcación","Provincia en registrada en el punto de suministro","Canton en registrada en el punto de suministro","Parroquia en registrada en el punto de suministro","Direccion1 en registrada en el punto de suministro","Direccion2 en registrada en el punto de suministro","Direccion3 en registrada en el punto de suministro","Direccion4 en registrada en el punto de suministro","Dirección extendida registrada en el punto de suministro","Caudal Aplicable","Caudal Fijo","Fecha de alta del punto de suministro","Fecha de baja del punto de suministro","Excluido de facturación por Catastro","Excluido de facturación Manual","Excluido de facturación Periódica"
2025-06-23T00:00:00Z,0099999,INDUSTRIAL,1301762264,FARFAN ALONZO,Activo,2025-06-23,2025-06-23,2025-06-23,,,N008 - Nacionales Industrial,,,a@b.com,a@b.com,,,MA-PO-000467-373168,MANABI,MANTA,MANTA,NACIONAL,DIR,,,,,User Import,,99999,0,0,MANTA,DZ4,,,,,,,,,2.6000,2.6000,2025-06-23,,,,
`;
    const result = analizarCruceRuaaEpa(ruaaRenovado, epaRow);
    const fila = result.filas.find((f) => f.cuentaUsuario === '0099999');
    expect(fila?.estadoTramiteRuaa).toBe('RENOVADO');
    expect(fila?.debeCobrar).toBe(true);
    expect(fila?.desalineacionEpaActivo).toBe(false);
  });
});
