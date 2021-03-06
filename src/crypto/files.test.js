jest.setTimeout(400000);

const path = require('path');
const fs = jest.requireActual('fs');
const Arweave = jest.requireActual('arweave/node');
import { settings } from '../config';
const { 
    wallet2PEM,
    encryptDataWithRSAKey,
    decryptDataWithRSAKey,
    decryptDataWithWallet,
    getFileEncryptionKey,
    getOnlineDataEncryptionKey,
    encryptFile,
    decryptFile,
    zipKey,
    unzipKey
} = require('./files');
import {downloadFile} from './arweave-helpers';

const { InitDB, setWalletFilePath, AddSyncedFolder, GetSyncedFolders } = require('../db/helpers'); 

import regeneratorRuntime from "regenerator-runtime";

beforeAll(function () {
    const current_folder = path.join(process.cwd(), 'src');

    const matches = GetSyncedFolders().filter(folder => folder.path == current_folder);

    if(matches.length == 0) {
        AddSyncedFolder(current_folder);
    }
});

afterAll(function() {
    if(fs.existsSync(path.join(process.cwd(), 'test-1-README.md.enc'))) {
        return fs.unlinkSync(path.join(process.cwd(), 'test-1-README.md.enc'));
    }
    if(fs.existsSync(path.join(process.cwd(), 'test-2-README.md.enc'))) {
        return fs.unlinkSync(path.join(process.cwd(), 'test-2-README.md.enc'));
    }
    if(fs.existsSync(path.join(process.cwd(), 'README.md.dec'))) {
        return fs.unlinkSync(path.join(process.cwd(), 'README.md.dec'));
    }
});

describe("Encypted File Ops", () => {
    test("Should encrypt data and decrypt back to orriginal data using same JWK", async () => {
        const aw = Arweave.init(settings.ARWEAVE_CONFIG);

        const jwk = await aw.wallets.generate();

        const key = wallet2PEM(jwk);

        const original_data = "Three Blind Mice";

        const encrypted_data = encryptDataWithRSAKey(original_data, key.private);

        const decrypted_data = decryptDataWithRSAKey(encrypted_data, key.private).toString('utf8');

        expect(decrypted_data).toBe(original_data);
    });

    test("Should decrypt data encoded with a specific wallet", async () => {
        const aw = Arweave.init(settings.ARWEAVE_CONFIG);

        const wallet = await aw.wallets.generate();

        const key = wallet2PEM(wallet);

        const original_data = key.private;

        const encrypted_data = encryptDataWithRSAKey(original_data, key.private);

        const decrypted_data = decryptDataWithWallet(Buffer.from(encrypted_data, 'binary'), wallet).toString('utf8');

        expect(decrypted_data).toBe(original_data);
    });

    test("getFileEncryptionKey should return the same key that was supplied to create new encrypted file", async () => {   
        const aw = Arweave.init(settings.ARWEAVE_CONFIG);

        const wallet = await aw.wallets.generate();
        const jwk = await aw.wallets.generate();
        const key = wallet2PEM(jwk);

        const result = await encryptFile(
            wallet, 
            jwk, 
            path.join(process.cwd(), 'README.md'), 
            path.join(process.cwd(), 'test-1-README.md.enc')
        );

        const original_data = key.private;

        const decrypted_data = await getFileEncryptionKey(result.file_path, result, wallet);

        expect(decrypted_data).toBe(original_data);

        return;
    });

    test("decryptFile should return the same data that was supplied to create new encrypted file", async () => {    
        const aw = Arweave.init(settings.ARWEAVE_CONFIG);

        const wallet = await aw.wallets.generate();
        const jwk = await aw.wallets.generate();
        const key = wallet2PEM(jwk);

        const result = await encryptFile(
            wallet, 
            jwk, 
            path.join(process.cwd(), 'assets\\images\\KlbjTuV9_400x400.jpg'), 
            path.join(process.cwd(), 'assets\\images\\KlbjTuV9_400x400.jpg.enc')
        );

        const original_data = fs.readFileSync(path.join(process.cwd(), 'assets\\images\\KlbjTuV9_400x400.jpg'));

        const private_key = await getFileEncryptionKey(result.file_path, result, wallet);

        expect(private_key.length).toBe(key.private.length);

        expect(private_key).toBe(key.private);

        debugger;

        const decrypted_result = await decryptFile(
            wallet, 
            private_key, 
            result.key_size, 
            result.file_path, 
            path.join(process.cwd(), 'assets\\images\\KlbjTuV9_400x400.jpg.dec')
        )

        const decrypted_data = fs.readFileSync(path.join(process.cwd(), 'assets\\images\\KlbjTuV9_400x400.jpg.dec'));

        debugger;

        expect(decrypted_data).toStrictEqual(original_data);

        return;
    });

    // test("getOnlineDataEncryptionKey should get the same key as getFileEncryptionKey but without downloading the full file", async () => {

    // });

    test("zipKey should generate a smaller string than the private key supplied", async () => {
        const aw = Arweave.init(settings.ARWEAVE_CONFIG);

        const wallet = await aw.wallets.generate();

        const key = wallet2PEM(wallet);

        const original_data = key.private;

        const zipped_key = zipKey(original_data);

        expect(zipped_key.length).toBeLessThan(original_data.length);
    });

    test("unzipKey should generate the same result as zipKey's input", async () => {
        const aw = Arweave.init(settings.ARWEAVE_CONFIG);

        const wallet = await aw.wallets.generate();

        const key = wallet2PEM(wallet);

        const original_data = key.private;

        const zipped_key = zipKey(original_data);

        const unzipped_key = unzipKey(zipped_key);

        // console.table({original_data, zipped_key, unzipped_key});

        expect(unzipped_key).toBe(original_data);
    });
});
