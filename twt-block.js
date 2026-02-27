const affectedAccountUrls = {},
  getNextPerson = function () {
    let e = Array.from(
      document.querySelectorAll('[aria-label="Timeline: Reposts"] > div > div'),
    )
      .concat(
        Array.from(
          document.querySelectorAll(
            '[aria-label="Timeline: Verified Followers"] > div > div',
          ),
        ),
      )
      .concat(
        Array.from(
          document.querySelectorAll(
            '[aria-label="Timeline: Followers"] > div > div',
          ),
        ),
      )
      .concat(
        Array.from(
          document.querySelectorAll(
            '[aria-label="Timeline: List members"] > div > div',
          ),
        ),
      );
    for (let t of e)
      try {
        let l =
          t.firstChild.firstChild.firstChild.firstChild.children[1].firstChild
            .firstChild.firstChild.firstChild.firstChild;
        if (l.href && !affectedAccountUrls[l.href]) return l;
      } catch (r) {}
    return !1;
  },
  findButton = function (e) {
    let t =
        document.querySelector('[data-testid="Dropdown"]') ||
        document.querySelector('[data-testid="sheetDialog"]'),
      l = Array.from(t.children);
    for (let r of l)
      if (r.children[1].firstChild.firstChild.textContent.startsWith(e + " @"))
        return r;
    return (console.log("Could not find " + e.toLowerCase() + " button"), !1);
  },
  performActionOnPerson = async function (e, t) {
    for (
      affectedAccountUrls[e.href] = !0, e.click();
      null === document.querySelector('[data-testid="userActions"]');
    )
      await sleep(10);
    for (
      document.querySelector('[data-testid="userActions"]').firstChild.click();
      !document.querySelector('[data-testid="Dropdown"]') ||
      document.querySelector('[data-testid="sheetDialog"]');
    )
      await sleep(10);
    let l = findButton(t);
    for (
      l &&
        (l.click(),
        "Block" === t &&
          (await sleep(50),
          document
            .querySelector('[data-testid="confirmationSheetConfirm"]')
            .click()),
        await sleep(50)),
        history.back();
      null === document.querySelector('[aria-label="Timeline: Reposts"]') &&
      null ===
        document.querySelector('[aria-label="Timeline: Verified Followers"]') &&
      null === document.querySelector('[aria-label="Timeline: Followers"]') &&
      null === document.querySelector('[aria-label="Timeline: List members"]');
    )
      await sleep(10);
    return Boolean(l);
  },
  scrollToNewPeople = async function () {
    let e =
        document.querySelector("[data-viewportview=true]") ||
        document.documentElement,
      t = e.scrollTop,
      l = performance.now();
    for (; !getNextPerson(); ) {
      if (((e.scrollTop += 100), t === e.scrollTop)) {
        if (performance.now() - l >= 2e3) return;
      } else l = performance.now();
      ((t = e.scrollTop), await sleep(1));
    }
  },
  performActionOnPeople = async function (e) {
    let t = 0;
    for (;;) {
      (console.log("Starting script"),
        await scrollToNewPeople(),
        console.log("Scrolled"));
      let l = getNextPerson();
      if ((console.log("Located next account"), l)) {
        let r = await performActionOnPerson(l, e);
        (console.log("Successfully performed action"), r && t++);
      } else {
        alert(t + " people " + e.toLowerCase() + "ed.");
        return;
      }
    }
  },
  sleep = async function (e) {
    return new Promise((t) => setTimeout(t, e));
  };
performActionOnPeople("Block");
