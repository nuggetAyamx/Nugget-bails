import './Utils/long-safe.js';
import makeWASocket from './Socket/index.js';
import chalk from 'chalk';

const CYAN = chalk.hex('#00c2ff');
const CYAN_BOLD = chalk.hex('#00c2ff').bold;
const GRAY = chalk.gray;
const DIM = chalk.dim;
const WHITE = chalk.white.bold;
const GREEN = chalk.hex('#00ff88').bold;
const YELLOW = chalk.hex('#ffd700').bold;

const banner = `
${CYAN('╔══════════════════════════════════════════════════════════════════════╗')}
${CYAN('║')}                                                                      ${CYAN('║')}
${CYAN('║')}  ${GREEN('⣇⣿⠘⣿⣿⣿⡿⡿⣟⣟⢟⢟⢝⠵⡝⣿⡿⢂⣼⣿⣷⣌⠩⡫⡻⣝⠹⢿⣿⣷')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡆⣿⣆⠱⣝⡵⣝⢅⠙⣿⢕⢕⢕⢕⢝⣥⢒⠅⣿⣿⣿⡿⣳⣌⠪⡪⣡⢑⢝⣇')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡆⣿⣿⣦⠹⣳⣳⣕⢅⠈⢗⢕⢕⢕⢕⢕⢈⢆⠟⠋⠉⠁⠉⠉⠁⠈⠼⢐⢕⢽')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡗⢰⣶⣶⣦⣝⢝⢕⢕⠅⡆⢕⢕⢕⢕⢕⣴⠏⣠⡶⠛⡉⡉⡛⢶⣦⡀⠐⣕⢕')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡝⡄⢻⢟⣿⣿⣷⣕⣕⣅⣿⣔⣕⣵⣵⣿⣿⢠⣿⢠⣮⡈⣌⠨⠅⠹⣷⡀⢱⢕')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡝⡵⠟⠈⢀⣀⣀⡀⠉⢿⣿⣿⣿⣿⣿⣿⣿⣼⣿⢈⡋⠴⢿⡟⣡⡇⣿⡇⡀⢕')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡝⠁⣠⣾⠟⡉⡉⡉⠻⣦⣻⣿⣿⣿⣿⣿⣿⣿⣿⣧⠸⣿⣦⣥⣿⡇⡿⣰⢗⢄')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⠁⢰⣿⡏⣴⣌⠈⣌⠡⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣬⣉⣉⣁⣄⢖⢕⢕⢕')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡀⢻⣿⡇⢙⠁⠴⢿⡟⣡⡆⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣵⣵⣿')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡻⣄⣻⣿⣌⠘⢿⣷⣥⣿⠇⣿⣿⣿⣿⣿⣿⠛⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⣷⢄⠻⣿⣟⠿⠦⠍⠉⣡⣾⣿⣿⣿⣿⣿⣿⢸⣿⣦⠙⣿⣿⣿⣿⣿⣿⣿⠟')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡕⡑⣑⣈⣻⢗⢟⢞⢝⣻⣿⣿⣿⣿⣿⣿⣿⠸⣿⠿⠃⣿⣿⣿⣿⣿⣿⡿⠁⣠')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡝⡵⡈⢟⢕⢕⢕⢕⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣿⣿⣿⣿⣿⠿⠋⣀⣈⠙')}  ${CYAN('║')}
${CYAN('║')}  ${GREEN('⡝⡵⡕⡀⠑⠳⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⢉⡠⡲⡫⡪⡪⡣')}  ${CYAN('║')}
${CYAN('║')}  ${YELLOW('The Nugget💥')}                                                       ${CYAN('║')}
${CYAN('║')}                                                                      ${CYAN('║')}
${CYAN('╠══════════════════════════════════════════════════════════════════════╣')}
${CYAN('║')}   ${WHITE('NuggetBaileys')} ${DIM('·')} ${GREEN('Beta Baileys')} ${YELLOW('update : 25 November 2026')}                  ${CYAN('║')}
${CYAN('║')}   ${GRAY('A Baileys-based WhatsApp Web library')}                                 ${CYAN('║')}
${CYAN('╚══════════════════════════════════════════════════════════════════════╝')}
`;

console.log(banner);

console.log(
  `${GRAY('this bail forked from grenxkontlv2:')}`
);
console.log(`${CYAN('→')} ${chalk.cyan.underline('https://t.me/najisbego')}\n`);

console.log(`${DIM('──────────────────────────────────────────────────────────────────────')}\n`);

export * from '../WAProto/index.js';
export * from './Utils/index.js';
export * from './Types/index.js';
export * from './Defaults/index.js';
export * from './WABinary/index.js';
export * from './WAM/index.js';
export * from './WAUSync/index.js';
export * from './Store/index.js';
export { makeWASocket };
export default makeWASocket;
