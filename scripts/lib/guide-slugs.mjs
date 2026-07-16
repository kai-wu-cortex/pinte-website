import fs from 'node:fs';
import ts from 'typescript';

export const GENERATED_GUIDE_LEGACY_SLUG_MIGRATIONS = Object.freeze([]);

function unwrapExpression(expression) {
  let current = expression;
  while (current && (
    ts.isAsExpression(current)
    || ts.isSatisfiesExpression(current)
    || ts.isParenthesizedExpression(current)
    || ts.isTypeAssertionExpression(current)
  )) {
    current = current.expression;
  }
  return current;
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

export function extractLegacyGuideSlugs(source) {
  if (typeof source !== 'string') throw new TypeError('GEO_GUIDES source must be a string');
  const sourceFile = ts.createSourceFile(
    'data/geoGuides.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  if (sourceFile.parseDiagnostics.length > 0) {
    const diagnostic = sourceFile.parseDiagnostics[0];
    const location = sourceFile.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
    throw new Error(`cannot parse data/geoGuides.ts at line ${location.line + 1}, column ${location.character + 1}: ${message}`);
  }

  let declaration;
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    declaration = statement.declarationList.declarations.find((candidate) => (
      ts.isIdentifier(candidate.name) && candidate.name.text === 'GEO_GUIDES'
    ));
    if (declaration) break;
  }
  if (!declaration) throw new Error('cannot find GEO_GUIDES top-level declaration in data/geoGuides.ts');

  const initializer = unwrapExpression(declaration.initializer);
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    throw new Error('GEO_GUIDES in data/geoGuides.ts must be initialized with an array literal');
  }

  const slugs = initializer.elements.map((element, elementIndex) => {
    const guide = unwrapExpression(element);
    if (!guide || !ts.isObjectLiteralExpression(guide)) {
      throw new Error(`GEO_GUIDES entry ${elementIndex} in data/geoGuides.ts must be an object literal`);
    }
    const slugProperties = guide.properties.filter((property) => (
      ts.isPropertyAssignment(property) && propertyNameText(property.name) === 'slug'
    ));
    if (slugProperties.length !== 1) {
      throw new Error(`GEO_GUIDES entry ${elementIndex} in data/geoGuides.ts must contain exactly one literal slug property`);
    }
    const value = unwrapExpression(slugProperties[0].initializer);
    if (!value || (!ts.isStringLiteral(value) && !ts.isNoSubstitutionTemplateLiteral(value))) {
      throw new Error(`GEO_GUIDES entry ${elementIndex} in data/geoGuides.ts must use a string literal slug`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.text)) {
      throw new Error(`GEO_GUIDES entry ${elementIndex} in data/geoGuides.ts has invalid slug ${JSON.stringify(value.text)}`);
    }
    return value.text;
  });
  if (slugs.length === 0) throw new Error('GEO_GUIDES in data/geoGuides.ts yielded no slugs');
  if (new Set(slugs).size !== slugs.length) throw new Error('GEO_GUIDES in data/geoGuides.ts contains duplicate slugs');
  return slugs.sort();
}

export function loadLegacyGuideSlugs(filePath) {
  return extractLegacyGuideSlugs(fs.readFileSync(filePath, 'utf8'));
}

export function isLegacySlugMigrationAllowed(
  slug,
  allowlist = GENERATED_GUIDE_LEGACY_SLUG_MIGRATIONS,
) {
  return allowlist.includes(slug);
}
