import fs from "fs";
import { runCheckOverChangedFiles } from "./utils/changedFilesValidator";
import { ExitCode } from "./utils/exitCode";
import * as logger from "./utils/logger";

export async function ValidateFileContent(filePath: string): Promise<ExitCode> 
{
    if (!filePath.includes("azure-pipelines"))
    {
        const fileContent = fs.readFileSync(filePath, "utf8");
        console.log(`file content is ${fileContent}`)
        console.log(`filePath is ${filePath}`)
        const searchText = "Azure Sentinel"
        const hasAzureSentinelText = fileContent.toLowerCase().includes(searchText.toLowerCase());
        const hasTargetProductAzureSentinel = fileContent.includes('"targetProduct": "Azure Sentinel"')

        console.log(`hasAzureSentinelText is ${hasAzureSentinelText}`)
        console.log(`hasTargetProductAzureSentinel is ${hasTargetProductAzureSentinel}`)
        if (hasAzureSentinelText && !hasTargetProductAzureSentinel)
        {
            console.log(`Inside of if condition`)
            throw new Error(`Please update text from 'Azure Sentinel' to 'Microsoft Sentinel' in file '${filePath}'`);
        }
    }
    return ExitCode.SUCCESS;
}

let fileTypeSuffixes = ["json", "txt", "md", "yaml", "yml", "py"];
let fileKinds = ["Added", "Modified"];
let CheckOptions = {
    onCheckFile: (filePath: string) => {
        return ValidateFileContent(filePath)
    },
    onExecError: async (e: any) => {
        logger.logError(`Content Validation check Failed: ${e.message}`);
    },
    onFinalFailed: async () => {
        logger.logError("An error occurred, please open an issue");
    },
};

runCheckOverChangedFiles(CheckOptions, fileKinds, fileTypeSuffixes);