# new documentations



## Issues



## Decisions

## Implementations



Always do a dry run before finalising process




## Description

        # Initialize result

        description = (
            "admin_facilities_"
            + valid_gee_text(district.lower())
            + "_"
            + valid_gee_text(block.lower())
        )
        asset_id = get_gee_asset_path(state, district, block) + description

        print("asset ID = ", asset_id)

        quit()


### Asset ID

If asset_id exists -> return

else, compute

```admin_boundary
    asset_id = get_gee_asset_path(state, district, block) + description

    collection, state_dir = clip_block_from_admin_boundary(state, district, block)

    layer_id = None
    # Generate shape files and sync to geoserver
    shp_path = create_shp_files(collection, state_dir, district, block, layer_id)
    create_gee_directory(state, district, block)
```


upload_shape_to_gee

def upload_shp_to_gee(
    shapefile_path, file_name, asset_id, gee_account_id=GEE_DEFAULT_ACCOUNT_ID
):



def export_vector_asset_to_gee(fc, description, asset_id):
    try:
        task = ee.batch.Export.table.toAsset(
            collection=fc,
            description=description,
            assetId=asset_id,
        )

        task.start()
        print(
            f"Successfully started the task for {description}, task id:{task.status()}"
        )
        return task.status()["id"]
    except Exception as e:
        print(f"Error occurred in running {description} task: {e}")
        return None



Put snapshots of where data is saved? How others can set it up on their GEE/Geoservers as well if they want to fork their own core stack. The data location constants are not obvious.


Library for merging tiff files: [yirgacheffe](https://yirgacheffe.org)


Habitable Trust: Data validation, ground truth


Any mechanisms to make the computations using lesser resources?


Any other possible visulalisations for embeddings other that maps?


Active Learning Interfaces


Non Eucledian Maps


D3 js gallery 


## Automated Unit testing

## Docker Usage

single setup scripts

Except tests

Selenium headless initial test framework/pipeline

Github Actions learn yaml


Unit tests


Explain it to people to utilise earth engine via python initialise gee


Parametric UMAP

Flatten it into different types, like for landuse, EvoTranspiration 










## Methodologies for Easy Open Access:

### A single Script:

 - .sh (requires ubuntu/wsl2) 
 - .ps1
 - .cmd
 - npm package
 - single python script (with ktinker or streamlit)
 - No django, server requirement
 - Files download to their local PC
 - No GEE, Geoserver requirement

### A plain single window frontend

 - The ability for them to download any file, clipped to any level, or even pan india--since we try to make available to download it from google drive afterall
 - A simple browser based map viewer interface
  + A implementation with integration of some such open source tools.
 - Some options for them to play with this data, and to create metrics such as in KYL



### A webportal for people to be able to download, learn, use, visualize, develop, add datasets, provide ground truth




### Core-Stack-API Key
    
    Limited Availability for every single tester




using which they can download files to their PCs, test out different pipelines, see how dif, 


### How-To Guides

#### README.md

Answer three questions in the first 30 seconds: What does this do? Why should I care? How do I install it? 

#### CONTRIBUTING.md

For co-builders, explicitly tell them how to build. 
Outline of how to set up the dev environment, your naming conventions, and how to submit a PR. 
Issue Template tags to your repo to funnel eager beginners.





Image Upscaling VIT - Drone Imagery, along with corresponding low resolution imgery or different resolution satellite images 







process for initialising and integrating external projects and repos to our platform




#

1. Installation Scripts: not fully working
2. Testing

3. Backend Installation: start with backend then frontend

Documentation Steps:

1. Aman's document, gaps

2. Kapil - documentations -- add gaps
3. Documentation outline


Ask pawan for morning discussion over documentation 


lowercase-uppercase
maintain same boundaries


For developers, request them to create a branch from dev branch and to submit PR's on them


The lifecycle of a core-stack request.





if variance >10	categorise


determine, based on variance

filter group

feature group

entropy of information for its value

```
Great. Folks, this is very good start for the "builder" persona of folks to install and build the CoRE stack. Couple of points to keep in mind as we sanitize and put this up: 

- Look at documentation done of other stacks and come up with an MD->html conversion to have a separate documentation website with typical flow structure like overview -> quick install -> get started -> [understand layer generation flow -> hydrology layers -> climate layers...] -> [add your own layers]...

- The most important part of this exercise is to not present a flattened view of the entire stack but to unpeel it like an onion, starting simple and going deeper. For example, things like celery thread configuration should come up much much later in some advanced section. 

- The backend itself may need to be reorganized, or at least the documentation, so that app-related things in the backend like stuff for the whatsapp bot or DPR generation are not shown in the same place as stuff which is core to the backend. Anyone installing the backend for layer generation should not be expected to know what is a DPR or the fact that there is a whatapp bot for something. 

- Similarly, the entire stuff about setting up projects, authentication, etc. should be presented in a separate chapter altogether. The basic first step I can think of is backend setup with admin dashboard for the superadmin to generate layers. Then we get into stuff about adding new layers. Then we talk about project setup. Later talk about celery configuration and everything. 

- So, the point being to think from the perspective of the user, i.e. somebody interested to contribute to the CoRE stack or to do a local installation, and think of how to present stuff to the person as if you were doing an induction for them. 

- What we should eventually aim for is a setup for anyone to install the stack for any area in the world. The above is the first step of course. Another aspect we'll need to crack is have a suite of notebooks or scripts to create the base layers for the area, and for model-derived layers like LULC to keep the stack flexible so that by default people can even use Dynamic World and such available layers. This will also help us clean up the code so that mapping like class X = LULC code 5, Y = LULC code 6, etc. is separated from class definitions X, Y... and the class definitions themselves can be configured based on what anyone needs. 


Similarly, we also need to come up with a documentation journey for a "user" persona, which would be pretty much on the lines of the workshop agenda after you have cleaned it up. 


Adi
```

Upon providing the location of our backend repo (eg: "/mnt/y/core-stack-org/core-stack-backend/"), the files in this documentation repo can be linked back to the backend or other provided repos. Or else, we will link it to remote repo https://github.com/core-stack-org/core-stack-backend/ and provide references/links to github blobs, line ranges etc, however if they have local repo, it should use that, we should also be able to record to which branch or state our documentation is linked to, so that we can troubleshoot easily, and include in our framework a foundation to gradually automate documentation upon detecting new merge to main branch. At the time of submitting PR, a clean merge for documentation files, or new files which document the new work must also be added. The PR submiters maybe should be able to submit without corresponding documentation, but they should get daily reminder to do it.




Local Test with scratch data

Local Development of pipelines.

Optional Upload to GEE, Geoserver

Encourage people to show and document any dataset they have generated, which we can add to our common standardised STAC data catalog hosted on our geoserver, or upload to a public repository for community review and integration.




Aquifier layer should simply be clipped or do we need to also factor in their depth, and the underground terrain, in order to determine, when the water may flow to other micro-aquifier?

BioMass Calculations: Fundamental Flaws: Mass above land, under land, P band data for carbon deposited in the roots, we may just be misguided.