/**
 * Re-export styleguide reading utilities from uilint-core
 */

export {
  findStyleGuidePath,
  readStyleGuide,
  readStyleGuideFromProject,
  writeStyleGuide,
  getDefaultStyleGuidePath,
  styleGuideExists,
} from "uilint-core/node";

export { parseStyleGuideSections, extractStyleValues } from "uilint-core";
