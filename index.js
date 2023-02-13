const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();

async function convertToPdf(htmlPath, pdfPath) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();

        const html = fs.readFileSync(htmlPath, 'utf8');
        await page.setContent(html);

        await page.evaluate(() => {
            const elementToHide = document.getElementById('vyta_logo');
            elementToHide.style.display = 'none';
        });

        const buffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '3.2cm',
                bottom: '3.2cm',
            },
            preferCSSPageSize: true,
            printBackground: true,
            displayHeaderFooter: false,
            headerTemplate: `<img alt="vyta" src="data:image/png;base64,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" style="width: 115.83px; height: 84.24px; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); margin-left: 50px"/>`,
            footerTemplate: ' '
        });

        await browser.close();
        fs.writeFileSync(pdfPath, buffer);
    } catch (error) {
        console.log(error);
    }

}




app.get('/pdf/:filename', async (req, res) => {
    const filename = req.params.filename;
    convertToPdf(`${filename}.html`, `${filename}.pdf`)
        .then(() => res.send('PDF file generated and saved to disk.'))
        .catch(error => res.send(error));
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
