/* AUTOMATICALLY GENERATED. DO NOT EDIT MANUALLY */
type Source = "";
const sources_new_to_old: string[] = [""];
const is_valid_source = (source: string): source is Source => {
  return sources_new_to_old.includes(source);
}

type Hyperlinks = {
  [key in Source]: string[]
};

const HYPERLINKS: Hyperlinks = {
  "": []
};