const puppeteer = require('puppeteer');

/**
 * Crawl a stock and generates a json file
 *
 * @param {string} stockName stock name
 */
async function crawlStock(stockName = null) {
  if (stockName != null) {
    const upperStockName = stockName.toLocaleUpperCase();
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.fundamentus.com.br/detalhes.php?papel=${upperStockName}`);

    const stockNotFoundRegex = /Nenhum papel encontrado/i;
    const found = (await page.content()).match(stockNotFoundRegex);

    if (found != null) {
      await browser.close();
      return { error: `stock ${upperStockName} not found` };
    }

    let stockInfo = {};
    try {
      stockInfo = await page.evaluate(() => {
        function removeInvalidChars(a) {
          return a.replace(/([\n\t])/gi, '').trim();
        }

        const scrappedInfo = {};
        const tableList = document.querySelectorAll('table.w728');
        if (tableList) {
          for (const table of tableList) {
            const columns = table.querySelectorAll('tr td.label, tr td.data');
            if (columns) {
              let key = '';
              let index = 0;
              for (const column of columns) {
                const text = column.querySelector('span.txt');
                if (text) {
                  const textContent = removeInvalidChars(text.textContent);
                  if (index % 2 == 0) {
                    key = textContent;
                  } else {
                    scrappedInfo[key] = textContent;
                  }
                }
                index++;
              }
            }
          }
        }
        return scrappedInfo;
      })
    } catch (err) {
      browser.close();
      throw new Error(err);
    }

    await browser.close();
    return stockInfo;
  }
}

module.exports = {
  crawlStock
};