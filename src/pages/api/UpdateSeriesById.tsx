import prisma from '../../components/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

import assert from 'assert';

type SettingsType = {
    numberToCount: number
}

async function updateSeries(id: any, settings: SettingsType) {
    var result = await prisma.series.update({
        where: {
            id: id
        },
        data: {
            settings: settings
        }
    })
    return result;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // check if we have all data.
        // The website stops this, but just in case
        try {
            assert.notStrictEqual(undefined, req.body.id, 'id required');

        } catch (bodyError) {
            res.json({ error: true, message: "information missing" });
            return;
        }
        var id = req.body.id
        var settings = req.body.settings

        var race = await updateSeries(id, settings)
        if (race) {
            res.json({ error: false, race: race });
        } else {
            // User exists
            res.json({ error: true, message: 'race not found' });
        }
    }
};