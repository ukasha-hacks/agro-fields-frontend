'use client';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryStates } from 'nuqs';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { urlParsers, toExplore } from '@/lib/url-state';
import {
  defaultFarmer,
  farmerSchema,
  exploreSchema,
  optionalNumber,
  draftFitsUrl,
  type FarmerValues,
} from '@/lib/validation';
import type { CropCatalog, Location } from '@/lib/api';
import { useApi } from '@/lib/use-api';
import { Button } from './ui/button';
import { HelpTip } from './help-tip';
import { CropPicker } from './crop-picker';
import { StatusMessage } from './status-message';

export function FarmerForm({ locations }: { locations: Location[] }) {
  const [state, setState] = useQueryStates(urlParsers, { shallow: true, history: 'replace' });
  const search = useSearchParams();
  const catalog = useApi<CropCatalog>('crops');
  const form = useForm<FarmerValues>({
    resolver: zodResolver(farmerSchema),
    defaultValues: state.farm ?? defaultFarmer,
    mode: 'onBlur',
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'crop_history' });
  const lastSent = useRef(JSON.stringify(state.farm ?? defaultFarmer));
  const [saveError, setSaveError] = useState('');
  const step = Math.min(3, Math.max(1, state.step));
  const selected = locations.find((l) => l.location_id === state.area);
  const explorationValid = exploreSchema.safeParse(toExplore(state)).success && !!selected;
  const invalidSavedDraft = !!search.get('farm') && !state.farm;
  useEffect(() => {
    const incoming = JSON.stringify(state.farm ?? defaultFarmer);
    if (incoming !== lastSent.current) {
      lastSent.current = incoming;
      form.reset(state.farm ?? defaultFarmer);
    }
  }, [state.farm, form]);
  useEffect(() => {
    const subscription = form.watch((values) => {
      const result = farmerSchema.safeParse(values);
      if (!result.success) return;
      if (!draftFitsUrl(result.data)) {
        setSaveError(
          'This draft is too long for a link. Use fewer past seasons or shorter season names.',
        );
        return;
      }
      setSaveError('');
      const serialized = JSON.stringify(result.data);
      if (serialized === lastSent.current) return;
      lastSent.current = serialized;
      void setState({ farm: result.data });
    });
    return () => subscription.unsubscribe();
  }, [form, setState]);
  async function nextStep() {
    const fields =
      step === 1
        ? (['crop_history'] as const)
        : (['water_supply', 'priority', 'soil', 'preferred_crops', 'excluded_crops'] as const);
    if (await form.trigger([...fields])) void setState({ step: step + 1 });
  }
  function showErrors(errors: FieldErrors<FarmerValues>) {
    if (errors.crop_history) void setState({ step: 1 });
    else if (errors.soil || errors.preferred_crops || errors.excluded_crops)
      void setState({ step: 2 });
  }
  async function submit(values: FarmerValues) {
    if (!explorationValid) {
      setSaveError('Check your area and history dates before continuing.');
      return;
    }
    if (!draftFitsUrl(values)) {
      setSaveError(
        'This draft is too long for a link. Use fewer past seasons or shorter season names.',
      );
      return;
    }
    setSaveError('');
    await setState({ farm: values, view: 'results', step: 3 }, { history: 'push' });
  }
  const error = form.formState.errors;
  return (
    <div>
      <div className="step-nav" aria-label="Farm form steps">
        {['Past crops', 'Your priorities', 'Next seasons'].map((label, index) => (
          <button
            key={label}
            type="button"
            aria-current={step === index + 1 ? 'step' : undefined}
            onClick={() => {
              void setState({ step: index + 1 });
            }}
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </div>
      <p className="draft-note">
        Your answers stay in this link. Share it only when you are ready.
        <HelpTip label="Saved form answers">
          Valid answers are saved in the page address. Refreshing or reopening the link restores
          them. An invalid value must be fixed before it can be saved. No account is needed.
        </HelpTip>
      </p>
      {invalidSavedDraft && (
        <p className="field-error mb-4" role="alert">
          The saved farm answers could not be read. Please check the fields and enter them again.
        </p>
      )}
      {!explorationValid && (
        <div className="insight-block mb-5">
          <p>Your area or history dates need a quick check.</p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              void setState({ view: 'history' });
            }}
          >
            Review history selection
          </Button>
        </div>
      )}
      <StatusMessage
        loading={catalog.loading}
        error={catalog.error}
        retry={catalog.refetch}
        kind="form"
      />
      {catalog.data && (
        <form onSubmit={form.handleSubmit(submit, showErrors)} noValidate className="space-y-6">
          {step === 1 && (
            <section className="space-y-5">
              <div>
                <h3 className="form-section-title">What grew here before?</h3>
                <p className="form-intro">
                  List past seasons from oldest to most recent. One season is enough to start.
                  <HelpTip label="Crop history">
                    Crop history means the crops you grew in past seasons. For example: maize, then
                    beans. Select more than one crop when they grew together. Fallow means the field
                    was left without a crop.
                  </HelpTip>
                </p>
              </div>
              {fields.map((field, index) => (
                <div className="season-block" key={field.id}>
                  <div className="flex items-start gap-3">
                    <div className="field flex-1">
                      <label htmlFor={`past-season-${index}`}>Season name</label>
                      <input
                        id={`past-season-${index}`}
                        placeholder="For example, 2024 first season"
                        {...form.register(`crop_history.${index}.season_label`)}
                        aria-invalid={!!error.crop_history?.[index]?.season_label}
                        aria-describedby={`past-error-${index}`}
                      />
                      <p id={`past-error-${index}`} className="field-error">
                        {error.crop_history?.[index]?.season_label?.message}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      disabled={fields.length === 1}
                      aria-label={`Remove past season ${index + 1}`}
                      onClick={() => remove(index)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <p className="mb-2 mt-4 text-xs text-muted">Crops grown together</p>
                  <Controller
                    control={form.control}
                    name={`crop_history.${index}.crops`}
                    render={({ field }) => (
                      <CropPicker
                        label={`Past season ${index + 1}`}
                        value={field.value}
                        onChange={field.onChange}
                        crops={catalog.data!.items}
                      />
                    )}
                  />
                  <p className="field-error">{error.crop_history?.[index]?.crops?.message}</p>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  append({ season_label: `Past season ${fields.length + 1}`, crops: ['unknown'] })
                }
                disabled={fields.length >= 20}
              >
                <Plus />
                Add a past season
              </Button>
            </section>
          )}
          {step === 2 && (
            <section className="space-y-6">
              <div>
                <h3 className="form-section-title">What matters most to you?</h3>
                <p className="form-intro">
                  Your priorities guide the questions we check. They are not a promise of better
                  yields or income.
                </p>
              </div>
              <div className="field">
                <label htmlFor="water-supply">
                  Where does your water come from?
                  <HelpTip label="Water supply">
                    Choose the option that best matches your farm. This is your answer, not a
                    satellite measurement of available irrigation water.
                  </HelpTip>
                </label>
                <select id="water-supply" {...form.register('water_supply')}>
                  <option value="unknown">Not sure</option>
                  <option value="rainfall_only">Rainfall only</option>
                  <option value="limited_irrigation">Some irrigation</option>
                  <option value="reliable_irrigation">Reliable irrigation</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="farm-priority">Your main priority</label>
                <select id="farm-priority" {...form.register('priority')}>
                  <option value="general">Explore my options</option>
                  <option value="improve_soil">Improve the soil</option>
                  <option value="conserve_water">Save water</option>
                  <option value="reduce_pests">Reduce pests</option>
                  <option value="income">Support farm income</option>
                </select>
              </div>
              <details
                className="optional-details"
                open={!!(error.soil || error.preferred_crops || error.excluded_crops) || undefined}
              >
                <summary>
                  Crop choices and soil details <span>Optional</span>
                </summary>
                <div className="mt-5 space-y-6">
                  <div>
                    <p className="mb-2 text-sm font-medium">Crops you prefer</p>
                    <Controller
                      control={form.control}
                      name="preferred_crops"
                      render={({ field }) => (
                        <CropPicker
                          label="Preferred crops"
                          value={field.value}
                          onChange={field.onChange}
                          crops={catalog.data!.items}
                          allowUnknown={false}
                        />
                      )}
                    />
                    <p className="field-error">{error.preferred_crops?.message}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Crops you want to avoid</p>
                    <Controller
                      control={form.control}
                      name="excluded_crops"
                      render={({ field }) => (
                        <CropPicker
                          label="Crops to avoid"
                          value={field.value}
                          onChange={field.onChange}
                          crops={catalog.data!.items}
                          allowUnknown={false}
                        />
                      )}
                    />
                    <p className="field-error">{error.excluded_crops?.message}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted">
                    Only add soil values you know from a local source or soil test. Leave them blank
                    when unsure.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="field">
                      <label htmlFor="soil-ph">
                        Soil pH
                        <HelpTip label="Soil pH">
                          pH describes how acid or alkaline the soil is. Use a test result between 0
                          and 14. A satellite wetness index cannot give this value.
                        </HelpTip>
                      </label>
                      <input
                        id="soil-ph"
                        type="number"
                        min={0}
                        max={14}
                        step="any"
                        placeholder="Not known"
                        {...form.register('soil.ph', { setValueAs: optionalNumber })}
                        aria-invalid={!!error.soil?.ph}
                        aria-describedby="soil-ph-error"
                      />
                      <p id="soil-ph-error" className="field-error">
                        {error.soil?.ph?.message}
                      </p>
                    </div>
                    <div className="field">
                      <label htmlFor="soil-carbon">
                        Organic carbon (%)
                        <HelpTip label="Organic carbon">
                          Use the percentage from a soil test. It is not the same as organic matter
                          percentage. Leave it blank if your test does not provide it.
                        </HelpTip>
                      </label>
                      <input
                        id="soil-carbon"
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        placeholder="Not known"
                        {...form.register('soil.organic_carbon_percent', {
                          setValueAs: optionalNumber,
                        })}
                        aria-invalid={!!error.soil?.organic_carbon_percent}
                      />
                      <p className="field-error">{error.soil?.organic_carbon_percent?.message}</p>
                    </div>
                  </div>
                  <Controller
                    control={form.control}
                    name="soil.texture"
                    render={({ field }) => (
                      <div className="field">
                        <label htmlFor="soil-texture">Soil texture</label>
                        <select
                          id="soil-texture"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        >
                          <option value="">Not known</option>
                          <option value="light">Light / sandy</option>
                          <option value="medium">Medium / loamy</option>
                          <option value="heavy">Heavy / clay</option>
                          <option value="organic">Organic</option>
                        </select>
                      </div>
                    )}
                  />
                </div>
              </details>
            </section>
          )}
          {step === 3 && (
            <section className="space-y-5">
              <div>
                <h3 className="form-section-title">Your next three seasons</h3>
                <p className="form-intro">
                  Enter the rotation you would normally use. This stays visible as your starting
                  plan.
                  <HelpTip label="Your starting rotation">
                    A rotation is the order of crops across seasons. We keep your own plan as the
                    baseline. Alternatives appear only when the data service has enough supporting
                    evidence.
                  </HelpTip>
                </p>
              </div>
              {[0, 1, 2].map((index) => (
                <div key={index} className="season-block">
                  <p className="mb-4 text-sm font-medium">Season {index + 1}</p>
                  <Controller
                    control={form.control}
                    name={`baseline_sequence.${index}.crops`}
                    render={({ field }) => (
                      <CropPicker
                        label={`Planned season ${index + 1}`}
                        value={field.value}
                        onChange={field.onChange}
                        crops={catalog.data!.items}
                      />
                    )}
                  />
                  <details className="mt-4">
                    <summary className="text-xs text-muted">
                      Add planting and harvest dates <span className="opacity-70">(optional)</span>
                    </summary>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(['planting_date', 'harvest_date'] as const).map((name) => (
                        <Controller
                          key={name}
                          control={form.control}
                          name={`baseline_sequence.${index}.${name}`}
                          render={({ field }) => (
                            <div className="field">
                              <label htmlFor={`${name}-${index}`}>
                                {name === 'planting_date' ? 'Planting' : 'Harvest'}
                              </label>
                              <input
                                id={`${name}-${index}`}
                                type="date"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value || null)}
                                onBlur={field.onBlur}
                                aria-invalid={!!error.baseline_sequence?.[index]?.[name]}
                              />
                              <p className="field-error">
                                {error.baseline_sequence?.[index]?.[name]?.message}
                              </p>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                  </details>
                  <p className="field-error">{error.baseline_sequence?.[index]?.crops?.message}</p>
                </div>
              ))}
              <label className="check-label">
                <input type="checkbox" {...form.register('repeats')} />I plan to repeat these three
                seasons.
              </label>
              <p className="text-xs text-muted">
                Dates may be future plans. The weather archive remains historical.
              </p>
            </section>
          )}
          {saveError && (
            <p className="field-error" role="alert">
              {saveError}
            </p>
          )}
          {step === 3 && (
            <p className="mb-4 text-sm leading-relaxed text-muted">
              Your result will stay visible at the bottom of the next panel. If evidence is missing,
              we will say so clearly.
            </p>
          )}
          <div className="form-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 1}
              onClick={() => {
                void setState({ step: step - 1 });
              }}
            >
              <ArrowLeft />
              Back
            </Button>
            {step < 3 ? (
              <Button
                key="continue"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  void nextStep();
                }}
              >
                Continue
                <ArrowRight />
              </Button>
            ) : (
              <Button
                key="review"
                type="submit"
                disabled={!explorationValid || form.formState.isSubmitting}
              >
                See my result
                <ArrowRight />
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
