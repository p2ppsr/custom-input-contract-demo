import React, { useState } from 'react'
import { Typography, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { createAction } from '@babbage/sdk'
import { toast } from 'react-toastify'
import bsv from 'bsv'

const useStyles = makeStyles(theme => ({
  content_wrap: {
    display: 'grid',
    placeItems: 'center',
    width: '100%',
    minHeight: '100vh'
  },
  action_button: {
    marginBottom: theme.spacing(3)
  }
}), { name: 'App' })

const App = () => {
  const [loading, setLoading] = useState(false)
  const classes = useStyles()

  const handleClick = async () => {
    try {
      setLoading(true)

      // Define the locking and unlocking scripts
      const lockingScript = '015d9f69' // 0x5d LESSTHAN VERIFY
      const unlockingScript = '51015c' // TRUE 0x5c

      const contract = await createAction({
        description: 'Put satoshis into a custom contract',
        keyName: 'primarySigning',
        keyPath: 'm/1033/1',
        outputs: [{
          script: lockingScript,
          satoshis: 1000
        }]
      }, false)
      console.log('Contract created:')
      console.log(contract)

      // discover the output index of the contract
      let index
      const tx = new bsv.Transaction(contract.rawTx)
      for (const i in tx.outputs) {
        if (tx.outputs[i].script.toHex() === lockingScript) {
          index = Number(i)
          console.log('Contract is in output', index)
        }
      }

      const redeem = await createAction({
        description: 'Redeem satoshis from a custom contract',
        keyName: 'primarySigning',
        keyPath: 'm/1033/1',
        inputs: {
          [contract.txid]: {
            ...contract,
            outputsToRedeem: [{
              index,
              unlockingScript
            }]
          }
        }
      }, false)
      console.log('Contract redeemed:')
      console.log(redeem)

      toast.success('Custom contract created and redeemed! Press F12 to see the logs in the console!')
    } catch (e) {
      console.error('Uh oh! Looks like something went wrong...')
      console.error(e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={classes.content_wrap}>
      <Typography variant='h1' align='center'>
        Custom Contract Demo
      </Typography>
      <Button
        className={classes.action_button}
        onClick={handleClick}
        variant='contained'
        color='primary'
        size='large'
        disabled={loading}
      >
        Run Demo
      </Button>
    </div>
  )
}

export default App
