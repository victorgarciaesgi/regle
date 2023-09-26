export function closestSibling(element: Element, selector: string): Element | undefined {
    const parent = element.parentElement;
    const siblings = Array.from([...(parent?.children ?? []), ...(parent?.parentElement?.parentElement?.children ?? [])]).filter(
        (el) => !el.isEqualNode(element),
    );
    return siblings.find((sib) => sib.matches(selector));
}
