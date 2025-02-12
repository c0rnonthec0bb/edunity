declare module '@acobb/firepower' {
    import * as admin from 'firebase-admin'
    import * as functions from 'firebase-functions/v1'

    export function initFirepower(app: typeof admin, functions: typeof functions): void

    export interface FirestoreContext<T = any> {
        dataChange: {
            transform: <R>(transformer: (data: T) => R) => {
                isUnequal: boolean;
                newValue: R;
            };
        };
        path: string;
        params: any;
    }

    export const firestore: {
        cloudDelete: (path?: string) => any;
        updateDoc: (path: string, data: any) => Promise<void>;
        getDoc:(path: string) => Promise<{
            exists: boolean;
            data: any;
            id: string;
            ref: any;
        }>;
        getCol:(path: string, queryAdditions: Array<(q: FirebaseFirestore.Query) => FirebaseFirestore.Query>) => Promise<{ docs: Array<{ id: string; data: any }> }>;
        setDoc: (path: string, data: any) => Promise<void>;
        deleteDoc: (path: string) => Promise<void>;
        collection: (path: string) => any;
        doc: (path: string) => any;
        serverTimestamp: () => any;
    }

    export const functions: {
        onDocUpdated: ((path: string, handler: (context: FirestoreContext) => Promise<any>) => functions.CloudFunction<any>) & {
            withOptions: (options: { memory?: string }, path: string, handler: (context: FirestoreContext) => Promise<any>) => functions.CloudFunction<any>
        };
        onDocCreated: ((path: string, handler: (context: FirestoreContext) => Promise<any>) => functions.CloudFunction<any>) & {
            withOptions: (options: { memory?: string }, path: string, handler: (context: FirestoreContext) => Promise<any>) => functions.CloudFunction<any>
        };
        onDocDeleted: ((path: string, handler: (context: FirestoreContext) => Promise<any>) => functions.CloudFunction<any>) & {
            withOptions: (options: { memory?: string }, path: string, handler: (context: FirestoreContext) => Promise<any>) => functions.CloudFunction<any>
        };
        onRequest: ((handler: (req: functions.https.Request, res: functions.Response) => Promise<void>) => functions.HttpsFunction) & {
            withOptions: (options: { memory?: string }, handler: (req: functions.https.Request, res: functions.Response) => Promise<void>) => functions.HttpsFunction
        };
    }
}
