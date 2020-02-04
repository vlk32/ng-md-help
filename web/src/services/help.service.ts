import {Observable} from "rxjs";

/**
 * Abstract service used to obtain help files
 */
export abstract class HelpService
{
    /**
     * Gets helpfile from path
     * @param _path - Path to help file
     */
    public get(_path: string): Observable<string>
    {
        return null;
    }
}