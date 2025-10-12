import { describe, expect, it } from "vitest";
import { parseBasePathFromUriPath } from "../urlUtil";

describe('urlUtil', () => {
  describe('parseBasePathFromUriPath()', () => {
    it('parses empty path', () => {
      expect(parseBasePathFromUriPath('')).toEqual('/');
    });

    it('parses single /', () => {
      expect(parseBasePathFromUriPath('/')).toEqual('/');
    });

    it('parses app name without /', () => {
      expect(parseBasePathFromUriPath('/app')).toEqual('/app/');
    });

    it('parses app name with /', () => {
      expect(parseBasePathFromUriPath('/app/')).toEqual('/app/');
    });

    it('parses longer path without trailing /', () => {
      expect(parseBasePathFromUriPath('/app/detail')).toEqual('/app/');
    });

    it('parses longer path with trailing /', () => {
      expect(parseBasePathFromUriPath('/app/detail/')).toEqual('/app/');
    });

    it('parses path with appname ending in filename', () => {
      expect(parseBasePathFromUriPath('/app/index.html')).toEqual('/app/');
    });

    it('parses staging path without trailing /', () => {
      expect(parseBasePathFromUriPath('/_app/000000')).toEqual('/_app/000000/');
    });

    it('parses staging path with trailing /', () => {
      expect(parseBasePathFromUriPath('/_app/000000/')).toEqual('/_app/000000/');
    });

    it('parses longer staging path without trailing /', () => {
      expect(parseBasePathFromUriPath('/_app/000000/detail')).toEqual('/_app/000000/');
    });

    it('parses longer staging path with trailing /', () => {
      expect(parseBasePathFromUriPath('/_app/000000/detail/')).toEqual('/_app/000000/');
    });

    it('parses longer staging path ending in filename', () => {
      expect(parseBasePathFromUriPath('/_app/000000/detail/index.html')).toEqual('/_app/000000/');
    });
  });
});