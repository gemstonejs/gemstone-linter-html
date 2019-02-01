/*
**  GemstoneJS -- Gemstone JavaScript Technology Stack
**  Copyright (c) 2016-2019 Gemstone Project <http://gemstonejs.com>
**  Licensed under Apache License 2.0 <https://spdx.org/licenses/Apache-2.0>
*/

/*  load external requirements  */
const path             = require("path")
const fs               = require("mz/fs")
const HTMLHint         = require("htmlhint").HTMLHint
const HTMLHintGemstone = require("gemstone-config-htmlhint")

/*  add custom Gemstone rules  */
let config = HTMLHintGemstone(HTMLHint)

/*  exported API function  */
module.exports = async function (filenames, opts = {}, report = { sources: {}, findings: [] }) {
    /*  interate over all source files  */
    let passed = true
    if (typeof opts.progress === "function")
        opts.progress(0.0, "linting HTML: starting")
    for (let i = 0; i < filenames.length; i++) {
        /*  indicate progress  */
        if (typeof opts.progress === "function")
            opts.progress(i / filenames.length, `linting HTML: ${filenames[i]}`)

        /*  read source code  */
        let source = await fs.readFile(filenames[i], "utf8")

        /*  determine name  */
        let name = path.relative(process.cwd(), filenames[i])

        /*  lint the source code  */
        let rules = Object.assign({}, config, opts.rules)
        let messages = HTMLHint.verify(source, rules)
        if (messages.length > 0) {
            for (let j = 0; j < messages.length; j++) {
                report.findings.push({
                    ctx:      "HTML",
                    filename: name,
                    line:     messages[j].line,
                    column:   messages[j].col,
                    message:  messages[j].message,
                    ruleProc: "htmlhint",
                    ruleId:   messages[j].rule.id
                })
            }
            report.sources[name] = source
            passed = false
        }
    }
    if (typeof opts.progress === "function")
        opts.progress(1.0, "")
    return passed
}

