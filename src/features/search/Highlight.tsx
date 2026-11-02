import { StyleSheet } from 'react-native';

import { Text, type TextProps } from '@/components/ui';
import { snippet } from '@/lib/search';
import { makeStyles } from '@/theme';

/** An excerpt of `text` around the query with the match marked (<mark>). */
export function Highlight({
  text,
  query,
  ...rest
}: { text: string; query: string } & Omit<TextProps, 'children'>) {
  const styles = useStyles();
  const { before, match, after } = snippet(text, query.trim());
  return (
    <Text {...rest}>
      {before}
      {match ? (
        <Text
          variant={rest.variant}
          script={rest.script}
          size={rest.size}
          weight="700"
          style={styles.mark}
        >
          {match}
        </Text>
      ) : null}
      {after}
    </Text>
  );
}

const useStyles = makeStyles((t) =>
  StyleSheet.create({
    mark: { backgroundColor: t.colors.goldTint, color: t.colors.text },
  }),
);
